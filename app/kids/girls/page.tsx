import { getProductsByCategory } from "@/app/lib/products";
import CategoryPage from "@/app/components/CategoryPage";
export const revalidate = 0;
export default async function Page() {
  const products = await getProductsByCategory("kids-girls");
  return <CategoryPage products={products} breadcrumbs={[{name:"Kids",href:"/kids"},{name:"Girls",href:"/kids/girls"}]}/>;
}
