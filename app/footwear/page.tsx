import { getProductsByCategory } from "@/app/lib/products";
import CategoryPage from "@/app/components/CategoryPage";
export const revalidate = 0;
export default async function Page() {
  const products = await getProductsByCategory("footwear");
  return <CategoryPage products={products} breadcrumbs={[{name:"Footwear",href:"/footwear"}]}/>;
}
