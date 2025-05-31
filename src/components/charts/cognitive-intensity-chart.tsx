
"use client"

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip as RechartsTooltip } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Brain } from "lucide-react"
import type { ClassifyCognitiveCategoriesOutput } from "@/ai/flows/classify-cognitive-categories"

interface CognitiveIntensityChartProps {
  classificationResult: ClassifyCognitiveCategoriesOutput | null;
}

interface ChartDataItem {
  name: string;
  intensity: number;
  fill: string;
}

// Helper to truncate text for chart labels
const truncateText = (text: string, maxLength: number = 20) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + "...";
};


export function CognitiveIntensityChart({ classificationResult }: CognitiveIntensityChartProps) {
  if (!classificationResult || !classificationResult.classifiedCategories || classificationResult.classifiedCategories.length === 0) {
    return null;
  }

  const chartData: ChartDataItem[] = classificationResult.classifiedCategories.map((category, index) => ({
    name: truncateText(category.categoryName),
    intensity: category.intensity,
    // Cycle through chart colors
    fill: `hsl(var(--chart-${(index % 5) + 1}))` 
  }));

  return (
    <Card className="shadow-md col-span-1 md:col-span-2 animate-fadeIn mt-6">
      <CardHeader>
        <CardTitle className="font-headline text-xl flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          Intensité des Catégories Cognitives
        </CardTitle>
        <CardDescription>Visualisation de l'intensité (0-10) des catégories cognitives détectées.</CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">Aucune catégorie spécifique avec intensité détectée pour la cartographie.</p>
        ) : (
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 30, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" domain={[0, 10]} stroke="hsl(var(--foreground))" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  stroke="hsl(var(--foreground))" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  width={120}
                  interval={0}
                />
                <RechartsTooltip
                  cursor={{ fill: "hsl(var(--muted))", fillOpacity: 0.5 }}
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--background))", 
                    borderColor: "hsl(var(--border))",
                    borderRadius: "var(--radius)",
                    color: "hsl(var(--foreground))"
                  }}
                  formatter={(value: number, name: string, props) => [`${value}/10`, truncateText(props.payload.name, 50)]}
                  labelFormatter={(label) => `Intensité`}

                />
                <Bar dataKey="intensity" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

