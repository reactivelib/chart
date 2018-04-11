import {IOptional, optional} from "@reactivelib/core";
import {joinObjects} from "../util";
/*
var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
var ARGUMENT_NAMES = /([^\s,]+)/g;
function getParamNames(func: Function) {
    var fnStr = func.toString().replace(STRIP_COMMENTS, '');
    var result = fnStr.slice(fnStr.indexOf('(')+1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);
    if(result === null)
        result = [];
    return result;
}

*/

interface IFunctionAndDependencies{
    func: Function;
    deps: any[];
}

function parseDependencies(factory: any): IFunctionAndDependencies{
    if (factory.length === 0){
        return {
            func: factory,
            deps: []
        }
    }
    if (!factory._deps){
        throw new Error("Dependencies not defined for factory "+factory);
    }
    return {
        func: factory, deps: factory._deps
    };
}

export interface IContainer{
    get<E>(name: string): IOptional<E>;
    keys(): string[];
    create(keys?: IContainer): {};
}

export class Container implements IContainer{

    public objects: any = {};
    public parent: IContainer;
    public requesting: any = {};

    constructor(public factories: {[s: string]: {}}){

    }

    public get<E>(name: string): IOptional<E>{
        var res = get<E>(name, this);
        return res;
    }

    public keys(){
        return Object.keys(this.factories);
    }

    public create(keys: IContainer = null): {}{
        if (!keys){
            keys = this;
        }
        return createObject(this, keys);
    }
    
    public _isContainer: boolean;

}

Container.prototype._isContainer = true;

var rvar = {};
var _autoStart = {};

export function variableFactory(f: any){
    f._type = rvar;
    return f;
}

export function autoStart(f: any){
    f._autoStart = _autoStart;
    return f;
}

function defineProperty<E>(container: ObjectContainer<E>, name: string){
    Object.defineProperty(container.instance, name, {
        get: () => {
            var val: any = container.get(name).value;
            if ((<any>container.factories[name])._type === rvar){
                return val.value;
            }
            return val;
        },
        enumerable: true,
        configurable: true
    });
}

export class ObjectContainer<E> extends Container{

    public autostarts: string[] = [];

    constructor(factories: {[s: string]: {}}, public instance: E){
        super(factories);
        this.objects.$instance = this.instance;
        for (var fact in factories){
            defineProperty(this, fact);
            if ((<any>factories[fact])._autoStart === _autoStart){
                this.autostarts.push(fact);
            }
        }
    }

    public addFactory(fact: string, factory){
        this.factories[fact] = factory;
        defineProperty(this, fact);
        if ((<any>this.factories[fact])._autoStart === _autoStart){
            this.autostarts.push(fact);
        }
    }

    public start(){
        this.autostarts.forEach(as => {
            this.get(as);
        });
    }

    public get<E>(name: string): IOptional<E>{
        var res = super.get<E>(name);
        if (res.present){
            var val: any = res.value;
            var f = this.factories[name];
            if ((<any>f)._type === rvar){
                Object.defineProperty(this.instance, name, {
                    get: () => {
                        return val.value;
                    },
                    enumerable: true,
                    configurable: true
                });
            }   
            else{
                Object.defineProperty(this.instance, name, {
                    get: () => {
                        return val;
                    },
                    enumerable: true,
                    configurable: true
                });
            }
        }
        return res;
    }

}

export function createWithObjectContainer(facts: any, parent: IContainer = null, instance = {}): {}{
    var cont = new ObjectContainer(facts, instance);
    cont.parent = parent;
    cont.start();
    return cont.instance;
}

function copyObject(obj: any){
    if (typeof  obj === "object"){
        var res = {

        }
        for (var a in obj){
            res[a] = obj[a];
        }
        return res;
    }
    return obj;
}

function getInjectContext(target: any){
    if (!target.hasOwnProperty("__inject_ctx")){
        var ctx = target.__inject_ctx;
        var c = {

        };
        target.__inject_ctx = c;
        if (ctx){
            for (var k in ctx){
                c[k] = copyObject(ctx[k]);
            }
        }
    }
    return target.__inject_ctx;
}

export function component(name: any, key?: string): any{
    if (!key){
        return function(target: any, key: string){
            var prot = target.prototype;
            var octx = getInjectContext(prot);
            octx.name = name;
        }
    }
}

export function inject(target: any, key: string){
    var octx = getInjectContext(target);
    var objects = octx.objects || {};
    objects[key] = {
        action: "inject"
    };
    octx.objects = objects;
}

export function init(target: any, key: string){
    var octx = getInjectContext(target);
    octx.init = target[key];
}

function doAssemble(target: any, key: any, assembler?: any){
    var octx = getInjectContext(target);
    var objects = octx.objects || {};
    var method = target[key];
    if (typeof method !== "function"){
        if (!assembler){
            method = target["create_"+key];
            if (typeof method !== "function"){
                throw new Error("No factory defined to assemble "+key);
            }
        }
        else {
            method = assembler
        }
        objects[key] = {
            action: "assemble",
            factory: method
        };
    }
    else
    {
        objects[key] = {
            action: "assemble_proxy",
            factory: method
        };
    }
    octx.objects = objects;
}

export function define(target: any, key: string){
    var octx = getInjectContext(target);
    var objects = octx.objects || {};
    objects[key] = {
        action: "define"
    };
    octx.objects = objects;
}

export function create(assembler: any, key?: string): any{
    if (!key){
        return function(target: any, key: string){
            return doAssemble(target, key, assembler);
        }
    }
    else {
        doAssemble(assembler, key);
    }

}

export interface IAssemblerSettings{
    facts?: any;
    parent?: IContainer;
    instance?: any;
    objects?: any;
}

export function assemble({
    facts = <any>{},
    parent = <IContainer>null,
    instance = <any>{},
    objects = <any>{}
}){
    var cont = new ObjectContainer(facts, instance);
    cont.parent = parent;
    for (var o in objects){
        cont.objects[o] = objects[o];
        instance[o] = objects[o];
    }
    assembleObject(cont.instance, cont);
    cont.start();
    return cont.instance;
}

function createObject(c: IContainer, keyContainer: IContainer){
    var keys = keyContainer.keys();
    var res: {[s: string]: {}}= {};
    keys.forEach(k => {
        var r = c.get(k);
        if (!r.present){

        }
        else
        {
            res[k] = r.value;
        }
    });
    return res;
}

function defineDependencyProperty(container: Container, k: string, o: any){
    Object.defineProperty(o, k, {
        get: function(){
            var dep = get(k, container);
            if (!dep.present){
                if (k === "$container"){
                    var val: any = container;
                }
                else {
                    throw new Error("Dependency "+k+" not present");
                }
            }
            else
            {
                val = dep.value;
            }
            Object.defineProperty(o, k, {
                value: val,
                configurable: true,
                enumerable: true
            });
            return val;
        },
        configurable: true,
        enumerable: true
    });

}

function defineAssembledProperty(container: ObjectContainer<any>, k: string, o: any, method: any){
    container.addFactory(k, method.bind(o));
}

function defineAssemblerProxy(k: string, o: any, method: any, container: IContainer){
    var old = o[k];
    o[k] = function(){
        var obj = old.apply(this, arguments);
        if (obj){
            assemble({
                instance: obj,
                parent: container
            });
        }
        return obj;
    }
}

function assembleObject(o: any, container: Container){
    if (!(o && typeof o === 'object')){
        return;
    }
    if (!o.__inject_ctx){
        return
    }
    if (o.__assembled){
        return;
    }
    if (o.__inject_ctx.name){
        container.objects[o.__inject_ctx.name] = o;
    }
    var objects = o.__inject_ctx.objects || {};
    for (var k in objects){
        var obj = objects[k];
        switch(obj.action){
            case "inject":
                defineDependencyProperty(container, k, o);
                break;
            case "assemble":
                defineAssembledProperty(<any>container, k, o, obj.factory);
                break;
            case "assemble_proxy":
                var fact = obj.factory;
                defineAssemblerProxy(k, o, fact, container);
                break;
            case "define":
                container.objects[k] = o[k];
                break;
        }
    }
    if (o.__inject_ctx.init){
        o.__inject_ctx.init.call(o);
    }
    o.__assembled = true;
}

function get<E>(name: string, container: Container): IOptional<E>{
    if (name in (<Container>container).objects){
        var obj = (<Container>container).objects[name];
        return optional<E>(<E>obj);
    }
    if (!(name in (<Container>container).factories)){
        if (container.parent){
            return get(name, <Container>container.parent);
        }
        return optional<E>();
    }
    if (container.requesting[name]){
        throw new Error("Cyclic dependency");
    }
    container.requesting[name] = true;
    var f = (<Container>container).factories[name];
    if (Array.isArray(f)){
        throw new Error("Array is illegal "+f);
    }
    if (typeof f !== "function"){
        container.objects[name] = f;
        assemble({
            parent: container,
            instance: f
        });
    }
    else
    {
        var deps = parseDependencies(f);
        var args: any[] = [];
        deps.deps.forEach(d => {
            if (Array.isArray(d)){
                throw new Error("Array is illegal "+f);
            }
            else {
                var cont = container;
                if (d === name){
                    cont = <Container>container.parent;
                }
                var val = get(d, cont);
                if (!val.present){
                    if (d === "$container"){
                        val = optional(container);
                    }
                    else {
                        throw new Error("Dependency "+d+" not present");
                    }
                }
                args.push(val.value);
            }
        });
        var res = deps.func.apply(null, args);
        container.objects[name] = res;
        assemble({
            parent: container,
            instance: res
        });
    }
    return optional<E>(<E>container.objects[name]);
}

export function container(factories: {[s: string]: {}}): Container{
    return new Container(factories);
}

export interface IConfiguration{

}

export function join(...factories: any[]): any{
    for (var i=0; i < factories.length; i++){
        if (factories[i] === void 0){
            throw new Error("Undefined factory");
        }
    }
    if (factories.length === 1){
        var res = factories[0];
        return res;
    }
    var res = joinObjects.apply(null, factories);
    return res;
}

export function deps<E>(func: E, deps: string[]): E{
    if (deps.length !== (<any>func).length){
        throw new Error("dependency mismatch in function "+func);
    }
    (<any>func)._deps = deps;
    return func;
}

export function buildFactories($container: IContainer, factories: {[s: string]: {}}): {}{
    var c = container(factories);
    var cont = c;
    if ($container){
        cont.parent = $container;
    }
    return cont.create(c);
}

export function buildAndFetch($container: IContainer, factories: {[s: string]: {}}, name: string): {}{
    var res = (<any>buildFactories($container, factories))[name];
    if (!res){
        throw new Error("Object does not exist: "+name);
    }
    return res;
}

export function fetchFromBuildObject(object: {}, name: string){
    var res = (<any>object)[name];
    if (!res){
        throw new Error("Object does not exist: "+name);
    }
    return res;
}