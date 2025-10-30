import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function AddQuestion() {
  return (
    <main className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">➕ Ajouter une question</h1>

      <Card className="max-w-2xl mx-auto shadow-md rounded-2xl">
        <CardContent className="p-6 space-y-6">
          {/* Texte de la question */}
          <div>
            <Label htmlFor="questionText">Texte de la question</Label>
            <Textarea id="questionText" placeholder="Écrivez votre question ici..." />
          </div>

          {/* Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="option1">Option 1</Label>
              <Input id="option1" placeholder="Réponse 1" />
            </div>
            <div>
              <Label htmlFor="option2">Option 2</Label>
              <Input id="option2" placeholder="Réponse 2" />
            </div>
            <div>
              <Label htmlFor="option3">Option 3</Label>
              <Input id="option3" placeholder="Réponse 3" />
            </div>
            <div>
              <Label htmlFor="option4">Option 4</Label>
              <Input id="option4" placeholder="Réponse 4" />
            </div>
          </div>

          {/* Réponse correcte */}
          <div>
            <Label htmlFor="correctAnswer">Réponse correcte</Label>
            <Select>
              <SelectTrigger id="correctAnswer">
                <SelectValue placeholder="Choisir la bonne réponse" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="option1">Option 1</SelectItem>
                <SelectItem value="option2">Option 2</SelectItem>
                <SelectItem value="option3">Option 3</SelectItem>
                <SelectItem value="option4">Option 4</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Matière */}
          <div>
            <Label htmlFor="subject">Matière</Label>
            <Select>
              <SelectTrigger id="subject">
                <SelectValue placeholder="Choisir une matière" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="maths">Mathématiques</SelectItem>
                <SelectItem value="geo">Géographie</SelectItem>
                <SelectItem value="art">Art</SelectItem>
                <SelectItem value="physique">Physique</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Concours / Examen */}
          <div>
            <Label htmlFor="exam">Concours / Examen</Label>
            <Select>
              <SelectTrigger id="exam">
                <SelectValue placeholder="Choisir un concours ou examen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bac">Bac</SelectItem>
                <SelectItem value="ens">Concours ENS</SelectItem>
                <SelectItem value="cap">CAP</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bouton */}
          <Button className="w-full">Ajouter la question</Button>
        </CardContent>
      </Card>
    </main>
  )
}
