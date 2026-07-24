import { router } from "express";
import {healtCheck} from "../controllers/healthcheck.controller.js";

const router = Router();

router.route("/").get(healthCheck);
export default router;