import app from "./app.js";
import { port } from "./config.js";

const server = app.listen(port, () => {
  console.log(`Server listening in port ${port}`);
});
