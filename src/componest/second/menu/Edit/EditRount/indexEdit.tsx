
import EditIndex from "../EditIndex";
import './indexEdit.css'
import { Route, Routes } from "react-router-dom";
import EditMachineOpertor from "../EditMachineOpertor/EditMachineOPertor";
import EditNewAccount from "../EditNewAccount/EditNewAccount";
import EditStep from "../EditCreateStep/EditStep";
import EditOptionSpec from "../../create/optionSpec/EditOptionSpec";
import EditOption from "../EditOption/EditOption";
import EditOptionType from "../EditOptionType/EditOptionType";

const IndexEdit =  () =>{
     return(
        <Routes>
            <Route path="/" element={<EditIndex/>} />
            <Route path ="/editNewAccount" element={<EditNewAccount/>} />
            <Route path='/editStep' element={<EditStep/>} />
            <Route path="editMachine" element={<h1>Edit Machine</h1>} />
            <Route path="/editMachineCategories" element={<EditMachineOpertor/>} />
            <Route path="/editOptionType/:id" element={<EditOptionType/>} />
            <Route path="/editOption/:id" element={<EditOption/>} />
            <Route path="/editOptionSpec/:id" element={<EditOptionSpec/>} />
        </Routes>
        )
}


export default IndexEdit;