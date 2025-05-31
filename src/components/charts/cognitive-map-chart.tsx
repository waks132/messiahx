"use client"

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip as RechartsTooltip } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Zap } from "lucide-react"
import type { AnalyzeTextOutput } from "@/ai/flows/analyze-text-for-manipulation"

interface CognitiveMapChartProps {
  analysisResults: AnalyzeTextOutput | null;
}

interface ChartDataItem {
  name: string;
  count: number;
  fill: string;
}

export function CognitiveMapChart({ analysisResults }: CognitiveMapChartProps) {
  if (!analysisResults) {
    return null;
  }

  const chartData: ChartDataItem[] = [
    { name: "Techniques Manipulatoires", count: analysisResults.manipulativeTechniques.length, fill: "hsl(var(--chart-1))" },
    { name: "Biais Cognitifs", count: analysisResults.cognitiveBiases.length, fill: "hsl(var(--chart-2))" },
    { name: "Faits Invérifiables", count: analysisResults.unverifiableFacts.length, fill: "hsl(var(--chart-3))" },
  ];

  return (
    <Card className="shadow-lg col-span-1 md:col-span-2 animate-fadeIn">
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center gap-2">
          <Zap className="h-6 w-6 text-primary" />
          Carte Cognitive (Synthèse)
        </CardTitle>
        <CardDescription>Visualisation des éléments détectés dans le texte.</CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.every(item => item.count === 0) ? (
          <p className="text-center text-muted-foreground py-8">Aucun élément spécifique détecté pour la cartographie.</p>
        ) : (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--foreground))" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <RechartsTooltip
                  cursor={{ fill: "hsl(var(--muted))", fillOpacity: 0.5 }}
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--background))", 
                    borderColor: "hsl(var(--border))",
                    borderRadius: "var(--radius)",
                    color: "hsl(var(--foreground))"
                  }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
