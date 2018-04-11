import {variable} from "@reactivelib/reactive";
import {IPointInterval} from "../../../../geometry/interval/index";

export default interface IFactoryTypes{
    maxWindow: variable.IVariable<IPointInterval>;
}