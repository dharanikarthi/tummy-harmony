import idliImg from '@/assets/foods/idli.jpg';
import dosaImg from '@/assets/foods/dosa.jpg';
import biryaniImg from '@/assets/foods/biryani.jpg';
import curdRiceImg from '@/assets/foods/curd-rice.jpg';
import bananaImg from '@/assets/foods/banana.jpg';
import oatsImg from '@/assets/foods/oats.jpg';
import coffeeImg from '@/assets/foods/coffee.jpg';
import samosaImg from '@/assets/foods/samosa.jpg';
import rotiDalImg from '@/assets/foods/roti-dal.jpg';
import upmaImg from '@/assets/foods/upma.jpg';
import pohaImg from '@/assets/foods/poha.jpg';
import khichdiImg from '@/assets/foods/khichdi.jpg';
import paneerTikkaImg from '@/assets/foods/paneer-tikka.jpg';
import chaiImg from '@/assets/foods/chai.jpg';
import vadaImg from '@/assets/foods/vada.jpg';
import parathaImg from '@/assets/foods/paratha.jpg';
import rajmaRiceImg from '@/assets/foods/rajma-rice.jpg';
import pongalImg from '@/assets/foods/pongal.jpg';
import buttermilkImg from '@/assets/foods/buttermilk.jpg';
import pizzaImg from '@/assets/foods/pizza.jpg';

export interface FoodSuggestion {
  name: string;
  image: string;
  rating: 'good' | 'moderate' | 'poor';
  category: string;
}

export const foodSuggestions: FoodSuggestion[] = [
  { name: 'Idli', image: idliImg, rating: 'good', category: 'Breakfast' },
  { name: 'Dosa', image: dosaImg, rating: 'moderate', category: 'Breakfast' },
  { name: 'Biryani', image: biryaniImg, rating: 'moderate', category: 'Main Course' },
  { name: 'Curd Rice', image: curdRiceImg, rating: 'good', category: 'Main Course' },
  { name: 'Banana', image: bananaImg, rating: 'good', category: 'Fruits' },
  { name: 'Oats', image: oatsImg, rating: 'good', category: 'Breakfast' },
  { name: 'Coffee', image: coffeeImg, rating: 'poor', category: 'Beverages' },
  { name: 'Samosa', image: samosaImg, rating: 'poor', category: 'Snacks' },
  { name: 'Roti & Dal', image: rotiDalImg, rating: 'good', category: 'Main Course' },
  { name: 'Upma', image: upmaImg, rating: 'good', category: 'Breakfast' },
  { name: 'Poha', image: pohaImg, rating: 'good', category: 'Breakfast' },
  { name: 'Khichdi', image: khichdiImg, rating: 'good', category: 'Main Course' },
  { name: 'Paneer Tikka', image: paneerTikkaImg, rating: 'moderate', category: 'Snacks' },
  { name: 'Chai', image: chaiImg, rating: 'moderate', category: 'Beverages' },
  { name: 'Vada', image: vadaImg, rating: 'poor', category: 'Snacks' },
  { name: 'Paratha', image: parathaImg, rating: 'moderate', category: 'Breakfast' },
  { name: 'Rajma Rice', image: rajmaRiceImg, rating: 'moderate', category: 'Main Course' },
  { name: 'Pongal', image: pongalImg, rating: 'good', category: 'Breakfast' },
  { name: 'Buttermilk', image: buttermilkImg, rating: 'good', category: 'Beverages' },
  { name: 'Pizza', image: pizzaImg, rating: 'poor', category: 'Snacks' },
];

export const foodImageMap: Record<string, string> = {};
foodSuggestions.forEach(f => {
  foodImageMap[f.name.toLowerCase()] = f.image;
});
