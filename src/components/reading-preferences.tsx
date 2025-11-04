"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Settings, Type, Minus, Plus } from "lucide-react";

const FONTS = [
  "Inter",
  "Times New Roman",
  "Arial",
  "Georgia",
  "Helvetica",
  "Merriweather",
  "Open Sans",
  "Roboto",
  "Source Serif Pro",
];

interface ReadingPreferencesProps {
  onStyleChange: (styles: { fontFamily: string; fontSize: number }) => void;
}

export function ReadingPreferences({ onStyleChange }: ReadingPreferencesProps) {
  const [fontFamily, setFontFamily] = useState("Inter");
  const [fontSize, setFontSize] = useState(16);

  const updateStyles = (
    newStyles: Partial<{
      fontFamily: string;
      fontSize: number;
    }>
  ) => {
    const updatedStyles = {
      fontFamily: newStyles.fontFamily ?? fontFamily,
      fontSize: newStyles.fontSize ?? fontSize,
    };

    setFontFamily(updatedStyles.fontFamily);
    setFontSize(updatedStyles.fontSize);

    onStyleChange(updatedStyles);
  };

  const adjustValue = (
    current: number,
    delta: number,
    min: number,
    max: number,
    step: number = 1
  ) => {
    const newValue = Math.max(min, Math.min(max, current + delta * step));
    return Math.round(newValue * 10) / 10; // Round to 1 decimal place
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-gray-400 hover:text-white hover:bg-gray-800"
        >
          <Settings className="w-4 h-4 mr-2" />
          Reading Preferences
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white">Reading Preferences</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Typeface */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Type className="w-5 h-5 text-gray-400" />
              <span className="text-gray-300 font-medium">Typeface</span>
            </div>
            <select
              value={fontFamily}
              onChange={(e) => updateStyles({ fontFamily: e.target.value })}
              className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {FONTS.map((font) => (
                <option key={font} value={font} className="bg-gray-800">
                  {font}
                </option>
              ))}
            </select>
          </div>

          {/* Font Size */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Type className="w-5 h-5 text-gray-400" />
              <span className="text-gray-300 font-medium">Font size</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white">{fontSize}px</span>
              <div className="flex gap-1">
                <button
                  onClick={() =>
                    updateStyles({
                      fontSize: adjustValue(fontSize, -1, 12, 24),
                    })
                  }
                  className="w-8 h-8 p-0 text-gray-400 hover:text-white hover:bg-gray-800 rounded-md flex items-center justify-center transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <button
                  onClick={() =>
                    updateStyles({
                      fontSize: adjustValue(fontSize, 1, 12, 24),
                    })
                  }
                  className="w-8 h-8 p-0 text-gray-400 hover:text-white hover:bg-gray-800 rounded-md flex items-center justify-center transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
