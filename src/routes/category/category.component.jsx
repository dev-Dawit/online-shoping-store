import { useState, useEffect, Fragment } from 'react';
import { useParams } from 'react-router-dom';             //is used in dynamic routing to direct a route using a parameter passed as a path 
import { useSelector } from 'react-redux';

import ProductCard from '../../components/product-card/product-card.component';
import Spinner from '../../components/spinner/spinner.component';

import { selectCategoriesIsLoading, selectCategoriesMap } from '../../store/categories/category.selector';

import './category.styles.scss';

//rendering a specific UI from a specific url
const Category = () => {
    const { category } = useParams();
    const  categoriesMap  = useSelector(selectCategoriesMap);
    const isLoading = useSelector(selectCategoriesIsLoading);
    const [products, setProducts] = useState(categoriesMap[category]);      //categoriesMap is fetched from firestore, it is asynchronous call but here we are trying to access items(categoriesMap[category]) like a synchronous call(we have it already) 

    useEffect(() => {
        setProducts(categoriesMap[category]);
    },[category, categoriesMap]);

    return(
        <Fragment>
            <h2 className='category-title'>{category.toUpperCase()}</h2>
                {isLoading ? <Spinner/>
                :(
                    <div className='category-container'>
                    {
                        products && products.map((product) => (<ProductCard key={product.id} product={product}/>) )    //making sure if we dont have products, from async call of categoriesMap from firestore, yet products && products.map... will short circuit to false rendering nothing   
                    }
                    </div>
                )}      
        </Fragment>
        
    )
}

export default Category;