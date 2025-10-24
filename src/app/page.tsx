"use client"

import Image from "next/image";
import styles from "./page.module.css";
import { Button, Card, CardBody } from "@heroui/react";

export default function Home() {
  return (
   <div className="p-10">
      <Card className="max-w-[400px]">
        <CardBody>
          <p>HeroUI Card Example</p>
          
          {/* Example of a HeroUI Button */}
          <Button 
            color="primary" 
            variant="shadow" 
            className="mt-4"
          >
            Get Started
          </Button>
        </CardBody>
      </Card>
    </div>
  );
}
