import { lazy } from "react"
import type { RouteObject } from "react-router-dom"
import { PublicLayout } from "@website/components/PublicLayout"

const Home = lazy(() => import("@website/Home").then((m) => ({ default: m.Home })))
const About = lazy(() => import("@website/About").then((m) => ({ default: m.About })))
const Team = lazy(() => import("@website/Team").then((m) => ({ default: m.Team })))
const Legal = lazy(() => import("@website/Legal").then((m) => ({ default: m.Legal })))

export const websiteRoutes: RouteObject[] = [
  {
    element: <PublicLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "about", element: <About /> },
      { path: "team", element: <Team /> },
      { path: "legal", element: <Legal /> },
    ],
  },
]