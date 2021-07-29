export const domain='ddu6.xyz'
async function get(path:string,params:Record<string,string>={},timeout=30000){
    const result=await new Promise(async(resolve:(val:{data:any}|number)=>void)=>{
        let paramsStr=new URLSearchParams(params).toString()
        if(paramsStr.length>0)paramsStr='?'+paramsStr
        setTimeout(()=>{
            resolve(503)
        },timeout)
        try{
            const res=await fetch(`https://${domain}/services/ph-get/${path}${paramsStr}`)
            if(res.status!==200){
                resolve(500)
                return
            }
            const {status,data}=await res.json()
            if(status===200){
                resolve({data:data})
                return
            }
            if(typeof status==='number'){
                resolve(status)
                return
            }
        }catch(err){
            console.log(err)
        }
        resolve(500)
    })
    return result
}
export async function getIds(start:number,token:string,password:string){
    if(token.length===0||password.length===0){
        return 401
    }
    const result:{data:number[]}|number=await get(`local/ids${start}`,{
        token:token,
        password:password
    })
    if(result===503){
        return 503
    }
    if(result===401){
        return 401
    }
    if(typeof result==='number'){
        return 500
    }
    return result.data
}
export async function getCIds(start:number,token:string,password:string){
    if(token.length===0||password.length===0){
        return 401
    }
    const result:{data:number[]}|number=await get(`local/cids${start}`,{
        token:token,
        password:password
    })
    if(result===503){
        return 503
    }
    if(result===401){
        return 401
    }
    if(typeof result==='number'){
        return 500
    }
    return result.data
}
export async function getInfo(token:string,password:string){
    if(token.length===0||password.length===0){
        return 401
    }
    const result:{data:{maxId:number,maxCId:number}}|number=await get(`local/info`,{
        token:token,
        password:password
    })
    if(result===503){
        return 503
    }
    if(result===401){
        return 401
    }
    if(typeof result==='number'){
        return 500
    }
    return result.data
}