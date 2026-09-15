import { db } from './firebase';
import { collection, getDocs, doc, deleteDoc, setDoc } from 'firebase/firestore';

const CUSTOM_PRODUCT = {
  id: "prod-custom-1",
  name: "Camisetas & Oversized Personalizadas",
  description: "Escolha o modelo, a cor, o tamanho e a sua estampa favorita. Você monta do seu jeito! Estampas exclusivas sob demanda.",
  price: 89.9,
  category: "oversize",
  imageUrl: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&auto=format&fit=crop&q=80",
  stockQuantity: 999,
  inStock: true,
  isFeatured: true,
  badge: "Monte o Seu 🎨",
  isCustomizable: true,
  availableModels: ["Camiseta Tradicional", "Oversized"],
  availableColors: ["Preto", "Branco", "Cinza", "Rosa", "Verde", "Azul", "Bege"],
  availableSizes: ["PP", "P", "M", "G", "GG", "XG"],
  availablePrints: [
    { id: "p1", name: "Good Vibes Cat", imageUrl: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=200&q=80", additionalPrice: 0 },
    { id: "p2", name: "Dark Butterfly", imageUrl: "https://images.unsplash.com/photo-1555685812-4b943f1cb0eb?w=200&q=80", additionalPrice: 10 },
    { id: "p3", name: "Skull Rock", imageUrl: "https://images.unsplash.com/photo-1595350020473-b3eb46114eb9?w=200&q=80", additionalPrice: 15 },
    { id: "p4", name: "Alien Peace", imageUrl: "https://images.unsplash.com/photo-1478479405421-ce83c92fb3ba?w=200&q=80", additionalPrice: 5 },
    { id: "p5", name: "Cherry Bomb", imageUrl: "https://images.unsplash.com/photo-1528654537330-8d5f3088b907?w=200&q=80", additionalPrice: 0 },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

async function seed() {
  console.log("Adding customizable product...");
  await setDoc(doc(db, 'products', CUSTOM_PRODUCT.id), CUSTOM_PRODUCT);
  console.log("Added successfully!");
  process.exit(0);
}

seed().catch(err => {
    console.error(err);
    process.exit(1);
});
