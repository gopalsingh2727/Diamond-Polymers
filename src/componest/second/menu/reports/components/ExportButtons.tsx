/**
 * Export Buttons - Pure CSS Version
 * NO TAILWIND - NO SHADCN
 */

import { Download, Printer } from "lucide-react";
import { Button } from "./pure";

interface ExportButtonsProps {
  onExportExcel: () => void;
  onPrint: () => void;
}

export function ExportButtons({ onExportExcel, onPrint }: ExportButtonsProps) {
  return (
    <div className="flex gap-2">
      <Button 
        variant="secondary" 
        size="sm" 
        onClick={onExportExcel}
      >
        <Download style={{ width: '1rem', height: '1rem' }} />
        <span className="hidden">Export Excel</span>
      </Button>
      <Button 
        variant="secondary" 
        size="sm" 
        onClick={onPrint}
      >
        <Printer style={{ width: '1rem', height: '1rem' }} />
        <span className="hidden">Print</span>
      </Button>
    </div>
  );
}
