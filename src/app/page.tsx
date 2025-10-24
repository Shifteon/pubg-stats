import Image from "next/image";
import styles from "./page.module.css";
import AvgKills from "@/components/avgKills";

export default function Home() {
  return (
    <div className="p-10">
      <AvgKills team="All"></AvgKills>
    </div>
  );
}
