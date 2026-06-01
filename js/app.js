import { aiRouter } from "./ai-router.js";
import { vault } from "./vault.js";

aiRouter.setKey("gemini", "YOUR_GEMINI_KEY");
aiRouter.setKey("openai", "YOUR_OPENAI_KEY");

document.getElementById("runAI").onclick = async () => {
  const prompt = document.getElementById("prompt").value;

  const result = await aiRouter.run(prompt);

  document.getElementById("output").textContent =
    `Brain: ${result.provider}\n\n${result.output}`;
};

window.testVault = async () => {
  await vault.save({ gemini: "API_KEY" }, "1234");
  const data = await vault.load("1234");
  console.log(data);
};
