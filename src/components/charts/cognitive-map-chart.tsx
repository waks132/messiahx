
"use client"

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip as RechartsTooltip, Cell } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Zap, ScanText } from "lucide-react"
import type { AnalyzeTextOutput } from "@/ai/flows/analyze-text-for-manipulation"

interface CognitiveMapChartProps {
  analysisResults: AnalyzeTextOutput | null;
}

interface ChartDataItem {
  name: string;
  count: number;
  fill: string; // Keep fill for potential direct use or as a fallback
  colorClass: string; // For Tailwind CSS gradient
}

const chartColors = [
  "hsl(var(--chart-1))", 
  "hsl(var(--chart-2))", 
  "hsl(var(--chart-3))"
];

const gradientClasses = [
  "fill-gradient-to-br from-purple-500 to-pink-500", // For Rhetorical Techniques
  "fill-gradient-to-br from-blue-500 to-teal-500",   // For Cognitive Biases
  "fill-gradient-to-br from-red-500 to-orange-500"    // For Unverifiable Facts
];


export function CognitiveMapChart({ analysisResults }: CognitiveMapChartProps) {
  if (!analysisResults) {
    return null;
  }

  const dataMap = [
    { name: "Techniques Rhétoriques", count: (analysisResults.rhetoricalTechniques || []).length, colorClass: gradientClasses[0], fill: chartColors[0] },
    { name: "Biais Cognitifs", count: (analysisResults.cognitiveBiases || []).length, colorClass: gradientClasses[1], fill: chartColors[1] },
    { name: "Faits Invérifiables", count: (analysisResults.unverifiableFacts || []).length, colorClass: gradientClasses[2], fill: chartColors[2] },
  ];
  
  // Filter out items with zero count to make the chart cleaner
  const chartData = dataMap.filter(item => item.count > 0);


  return (
    <Card className="shadow-xl col-span-1 md:col-span-2 animate-fadeIn bg-card/80 backdrop-blur-sm border-primary/20">
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center gap-2 text-primary">
          <ScanText className="h-6 w-6" />
          Aperçu des Éléments Discursifs
        </CardTitle>
        <CardDescription>Visualisation quantitative des types d'éléments identifiés dans le texte.</CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <p className="text-center text-muted-foreground py-8 italic">Aucun élément spécifique détecté pour la cartographie quantitative.</p>
        ) : (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--foreground))" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <RechartsTooltip
                  cursor={{ fill: "hsl(var(--muted))", fillOpacity: 0.3 }}
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--background))", 
                    borderColor: "hsl(var(--border))",
                    borderRadius: "var(--radius)",
                    color: "hsl(var(--foreground))",
                    boxShadow: "0 4px 12px hsla(var(--foreground), 0.1)"
                  }}
                  formatter={(value, name, props) => [`${value} trouvé(s)`, props.payload.name]}
                  labelFormatter={(label) => ""}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={35}>
                    {chartData.map((entry, index) => (
                        // The 'fill' attribute is directly used by Recharts cells
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
