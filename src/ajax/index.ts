/**
 *
 */
export interface IAjaxRequest{

    url: string;
    data?: any;
    method?: string;
    result: (res: XMLHttpRequest) => void;

}

export default function request(settings: IAjaxRequest){
    var xhttp = new XMLHttpRequest();
    var url = settings.url;
    var method = settings.method || "GET";
    if (method === "GET"){
        if (settings.data){
            url += "&";
            for (var dat in settings.data){
                url += dat+"="+encodeURIComponent(settings.data[dat]);
            }
        }
    }
    xhttp.open(method, url, true);
    if (method === "GET"){
        xhttp.send();
    }
    else {
        
    }
    xhttp.onreadystatechange = (ev) => {
        if (xhttp.readyState === 4){
            settings.result(xhttp);
        }
    }
    return xhttp;
}