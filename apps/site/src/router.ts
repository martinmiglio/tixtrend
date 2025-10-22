import { routeTree } from "./routeTree.gen";
import { ErrorComponent } from "@/components/error/ErrorComponent";
import { NotFoundComponent } from "@/components/error/NotFoundComponent";
import { createRouter } from "@tanstack/react-router";

export function getRouter() {
  const router = createRouter({
    routeTree,
    scrollRestoration: true,
    defaultErrorComponent: ErrorComponent,
    defaultNotFoundComponent: NotFoundComponent,
  });

  return router;
}
