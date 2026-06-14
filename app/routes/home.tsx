import { redirect } from "react-router";
import type { Route } from "./+types/home";

export function loader({}: Route.LoaderArgs) {
  return redirect("/seguimiento");
}

export default function Home() {
  return null;
}