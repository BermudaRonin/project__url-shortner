import { Router } from "express";
import * as controller from "./controller";

const routes = Router();

routes.get("/:code", controller.redirectToURL);
routes.get("/:code/stats", controller.getStats);
routes.post("/", controller.shortenURL);

export default routes;