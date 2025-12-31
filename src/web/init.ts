import init, { /* initThreadPool, */ init_panic_hook } from "@luxfhe/wasm";

export async function initTfhe() {
  await init();
  //await initThreadPool(navigator.hardwareConcurrency); Not working, may be fixed in the future
  await init_panic_hook();
}
