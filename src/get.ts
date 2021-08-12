export const serverDomain='ddu6.de'
const requestTimeout=60
interface Res{
    body:string
    headers:Headers
    status:number
}
async function request(url:string,params:Record<string,string>={},form:Record<string,string>={},cookie='',referer=''){
    let paramsStr=new URL(url).searchParams.toString()
    if(paramsStr.length>0){
        paramsStr+='&'
    }
    paramsStr+=new URLSearchParams(params).toString()
    if(paramsStr.length>0){
        paramsStr='?'+paramsStr
    }
    url=new URL(paramsStr,url).href
    const formStr=new URLSearchParams(form).toString()
    const headers:HeadersInit={}
    if(cookie.length>0){
        headers.Cookie=cookie
    }
    if(referer.length>0){
        headers.Referer=referer
    }
    const options:RequestInit={
        method:formStr.length>0?'POST':'GET',
        headers:headers,
        referrerPolicy:'no-referrer'
    }
    if(formStr.length>0){
        Object.assign(headers,{
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        })
        Object.assign(options,{
            body:formStr
        })
    }
    const result=await new Promise(async(resolve:(val:number|Res)=>void)=>{
        setTimeout(()=>{
            resolve(500)
        },requestTimeout*1000)
        const res=await fetch(url,options)
        const {headers,status}=res
        if(status!==200){
            resolve(status)
            return
        }
        try{
            const body=await res.text()
            resolve({
                status:status,
                body:body,
                headers:headers
            })
        }catch(err){
            console.log(err)
        }
        resolve(500)
    })
    return result
}
async function get(path:string,params:Record<string,string>={}){
    const res=await request(`https://${serverDomain}/phs/${path}`,params)
    if(typeof res==='number'){
        return 500
    }
    if(res.body.length===0){
        return 500
    }
    try{
        const {status,data}=JSON.parse(res.body)
        if(status===200){
            return {data}
        }
        if(typeof status==='number'){
            return status
        }
    }catch(err){
        console.log(err)
    }
    return 500
}
export async function getIds(start:number,password:string){
    const result:{data:number[]}|number=await get(`local/ids${start}`,{
        password:password
    })
    if(result===503){
        return 503
    }
    if(typeof result==='number'){
        return 500
    }
    return result.data
}
export async function getCIds(start:number,password:string){
    const result:{data:number[]}|number=await get(`local/cids${start}`,{
        password:password
    })
    if(result===503){
        return 503
    }
    if(typeof result==='number'){
        return 500
    }
    return result.data
}
export async function getInfo(password:string){
    const result:{data:{maxId:number,maxCId:number}}|number=await get(`local/info`,{
        password:password
    })
    if(result===503){
        return 503
    }
    if(typeof result==='number'){
        return 500
    }
    return result.data
}