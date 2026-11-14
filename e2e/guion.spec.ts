// Guion de demo (tasks.md): Rosa recibe avisos, pregunta, se le pide algo y la llaman.
// Reglas de producto que también se verifican: cero información clínica y el escalamiento se cancela al confirmar.
import { expect, test, type Page } from "@playwright/test";

const panel = (page: Page) => page.getByRole("region", { name: "Urgencias adultos" });
const phone = (page: Page) => page.getByRole("region", { name: "Teléfono de Rosa" });
const tracker = (page: Page) => page.getByRole("region", { name: "¿Cómo va su paciente?" });
const publish = (page: Page, label: string) => panel(page).getByRole("button", { name: label }).click();

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await expect(phone(page)).toBeVisible();
});

test("guion completo de 3 minutos", async ({ page }) => {
  // 2. Enfermería toca E02 → aviso en el teléfono y la web pasa a "En atención".
  await publish(page, "Ya está en atención");
  await expect(phone(page).getByText("Su paciente ya está siendo atendido.").last()).toBeVisible();
  await expect(tracker(page).locator('[aria-current="step"]')).toContainText("En atención");

  // 3. Informes toca B01 → la web da permiso para descansar.
  await publish(page, "Informe a las 14:00");
  await expect(tracker(page).getByText(/No hay nada pendiente para usted antes de las 14:00/)).toBeVisible();

  // 4. Rosa pregunta dónde dormir → albergue con cupo.
  await phone(page).getByRole("button", { name: "¿Dónde puedo dormir?" }).click();
  await expect(phone(page).getByText(/Albergue .* camas libres/)).toBeVisible();

  // 5. Pregunta clínica → nunca se responde por chat.
  await phone(page).getByRole("button", { name: "¿Qué tiene mi esposo?" }).click();
  await expect(phone(page).getByText(/Eso se lo informa el médico en persona/)).toBeVisible();

  // 6. Enfermería toca E08 → aparece el pendiente y se retira el permiso de descansar.
  await publish(page, "Se necesitan donadores");
  await expect(tracker(page).getByText("Conseguir donadores de sangre")).toBeVisible();
  await expect(tracker(page).getByText(/No hay nada pendiente para usted antes de/)).toHaveCount(0);

  // 7. Trabajo social toca E07 → Rosa no contesta → SMS (4 s) → llamada (8 s) → "Voy en camino".
  await publish(page, "El médico quiere hablar");
  await expect(panel(page).getByText("Aviso urgente a Rosa")).toBeVisible();
  await expect(phone(page).getByText("Mensaje SMS")).toBeVisible({ timeout: 6_000 });
  const call = page.getByRole("dialog", { name: "Llamada entrante" });
  await expect(call).toBeVisible({ timeout: 6_000 });
  await call.getByRole("button", { name: "Contestar: voy en camino" }).click();

  // 8. El panel muestra que la familia va en camino, con el tiempo del llamado.
  await expect(call).toHaveCount(0);
  await expect(panel(page).getByText("Familiar en camino a informes.")).toBeVisible();
  await expect(panel(page).getByText(/Rosa confirmó: va en camino en \d+:\d{2}/)).toBeVisible();
  await expect(tracker(page).getByText(/Usted confirmó que va en camino/)).toBeVisible();
});

test("confirmar a tiempo cancela el SMS y la llamada", async ({ page }) => {
  await publish(page, "El médico quiere hablar");
  await phone(page).getByRole("button", { name: "Voy en camino" }).click();
  await expect(panel(page).getByText("Familiar en camino a informes.")).toBeVisible();
  await page.waitForTimeout(9_000); // más que SMS (4 s) + llamada (8 s)
  await expect(phone(page).getByText("Mensaje SMS")).toHaveCount(0);
  await expect(page.getByRole("dialog", { name: "Llamada entrante" })).toHaveCount(0);
});

test("ninguna pregunta clínica recibe información clínica", async ({ page }) => {
  await publish(page, "Informe a las 14:00");
  for (const q of ["¿Qué tiene mi esposo?", "¿Está grave?", "¿Qué medicina le dieron?", "¿Cuál es el diagnóstico?"]) {
    await phone(page).getByLabel("Escriba su pregunta").fill(q);
    await phone(page).getByRole("button", { name: "Enviar pregunta" }).click();
    await expect(phone(page).getByText("Escribiendo…")).toHaveCount(0);
  }
  await expect(phone(page).getByText(/Eso se lo informa el médico en persona/)).toHaveCount(4);
});

test("reiniciar deja la demo como al principio", async ({ page }) => {
  await publish(page, "Ya está en atención");
  await publish(page, "Se necesitan donadores");
  await panel(page).getByRole("button", { name: "Reiniciar demo" }).click();
  await expect(tracker(page).locator('[aria-current="step"]')).toContainText("Registro");
  await expect(tracker(page).getByText("Conseguir donadores de sangre")).toHaveCount(0);
  await expect(panel(page).getByText("Enviado")).toHaveCount(0);
});
