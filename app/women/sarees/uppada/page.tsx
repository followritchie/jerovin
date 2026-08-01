import { getProductsByCategory } from "@/app/lib/products";
import CategoryPage from "@/app/components/CategoryPage";
export const revalidate = 0;
export default async function Page() {
  const products = await getProductsByCategory("women-sarees-uppada");
  return <CategoryPage products={products} breadcrumbs={[{name:"Women",href:"/women"},{name:"Sarees",href:"/women/sarees"},{name:"Uppada Silk Sarees",href:"/women/sarees/uppada"}]}/>;
}
