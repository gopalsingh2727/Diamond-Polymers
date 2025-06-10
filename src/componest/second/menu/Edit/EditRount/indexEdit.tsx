
import EditIndex from "../EditIndex";
import './indexEdit.css'
import { Route, Routes } from "react-router-dom";
import EditMachineOpertor from "../EditMachineOpertor/EditMachineOPertor";
import EditNewAccount from "../EditNewAccount/EditNewAccount";
import EditMaterials from "../EditMaterials/EditMaterials";
import EditProduct from "../EditProducts/EditProduct";
import EditProductCategoris from "../EditProducts/EditProductCategoris";
import EditStep from "../EditCreateStep/EditStep";




const IndexEdit =  () =>{
     return(
        <Routes>
            <Route path="/" element={<EditIndex/>} />
            <Route path ="/editNewAccount" element={<EditNewAccount/>} />
            <Route path='/editProduct' element={<EditProduct/>} />
            <Route path='/editProductCategories' element={<EditProductCategoris/>} />
            <Route path='/editStep' element={<EditStep/>} />
          
            <Route path="editMaterials" element={<EditMaterials/>} />

            <Route path="editMachine" element={<h1>Edit Machine</h1>} />
            <Route path="/editMachineCategories" element={<EditMachineOpertor/>} />

        </Routes>     
        )
}


export default IndexEdit;