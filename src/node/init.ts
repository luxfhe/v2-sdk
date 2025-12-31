import { init_panic_hook } from "@luxfhe/wasm/node";

export async function initTfhe() {
  await init_panic_hook();
}
