export default function<E>(text: string): E[]{
    var data = <E[]>JSON.parse("("+text+")");
    return data;
}