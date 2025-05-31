
"use client"

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip as RechartsTooltip, Cell } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Zap, ScanText } from "lucide-react"
import type { AnalyzeTextOutput } from "@/ai/flows/analyze-text-for-manipulation"

interface CognitiveMapChartProps {
  analysisResults: AnalyzeTextOutput | null;
  currentLanguage: string;
}

interface ChartDataItem {
  name: string;
  count: number;
  fill: string; 
  colorClass: string; 
}

const chartColors = [
  "hsl(var(--chart-1))", 
  "hsl(var(--chart-2))", 
  "hsl(var(--chart-3))"
];

const gradientClasses = [
  "fill-gradient-to-br from-purple-500 to-pink-500", 
  "fill-gradient-to-br from-blue-500 to-teal-500",   
  "fill-gradient-to-br from-red-500 to-orange-500"    
];

const chartLabels: Record<string, Record<string, string>> = {
  fr: {
    rhetoricalTechniques: "Techniques Rhétoriques",
    cognitiveBiases: "Biais Cognitifs",
    unverifiableFacts: "Faits Invérifiables",
    tooltipCountSuffix: "trouvé(s)",
    title: "Aperçu des Éléments Discursifs",
    description: "Visualisation quantitative des types d'éléments identifiés dans le texte.",
    noData: "Aucun élément spécifique détecté pour la cartographie quantitative."
  },
  en: {
    rhetoricalTechniques: "Rhetorical Techniques",
    cognitiveBiases: "Cognitive Biases",
    unverifiableFacts: "Unverifiable Facts",
    tooltipCountSuffix: "found",
    title: "Overview of Discursive Elements",
    description: "Quantitative visualization of the types of elements identified in the text.",
    noData: "No specific elements detected for quantitative mapping."
  }
};


export function CognitiveMapChart({ analysisResults, currentLanguage }: CognitiveMapChartProps) {
  const labels = chartLabels[currentLanguage] || chartLabels.fr;

  if (!analysisResults) {
    return null;
  }

  const dataMap = [
    { name: labels.rhetoricalTechniques, count: (analysisResults.rhetoricalTechniques || []).length, colorClass: gradientClasses[0], fill: chartColors[0] },
    { name: labels.cognitiveBiases, count: (analysisResults.cognitiveBiases || []).length, colorClass: gradientClasses[1], fill: chartColors[1] },
    { name: labels.unverifiableFacts, count: (analysisResults.unverifiableFacts || []).length, colorClass: gradientClasses[2], fill: chartColors[2] },
  ];
  
  const chartData = dataMap.filter(item => item.count > 0);


  return (
    <Card className="shadow-xl animate-fadeIn bg-card/80 backdrop-blur-sm border-primary/20">
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center gap-2 text-primary">
          <ScanText className="h-6 w-6" />
          {labels.title}
        </CardTitle>
        <CardDescription>{labels.description}</CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <p className="text-center text-muted-foreground py-8 italic">{labels.noData}</p>
        ) : (
          <div className="h-[200px] w-full"> {/* Reduced height */}
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
                  formatter={(value, name, props) => [`${value} ${labels.tooltipCountSuffix}`, props.payload.name]}
                  labelFormatter={(label) => ""}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={35}>
                    {chartData.map((entry, index) => (
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


    