import * as css from '../../lib/css'
import {getIds,getCIds, getInfo} from '../../funcs/get'
export class Main{
    element=document.createElement('div')
    style=document.createElement('style')
    cmdInput=document.createElement('input')
    console=document.createElement('div')
    cmd=''
    token=''
    password=''
    constructor(){
        const {element,style,cmdInput,console}=this
        style.textContent=css.main
        cmdInput.addEventListener('keydown',async e=>{
            if(e.key==='Enter'){
                await this.exec()
            }
        })
        cmdInput.classList.add('cmd')
        console.classList.add('console')
        element.append(style)
        element.append(cmdInput)
        element.append(console)
    }
    async init(){
        const token=window.localStorage.getItem('ph-token')
        if(typeof token==='string'&&token.length===32){
            this.token=token
        }
        const password=window.localStorage.getItem('ph-password')
        if(typeof password==='string'&&password.length>0){
            this.password=password
        }
    }
    async exec(){
        const {cmdInput,console}=this
        const tmpCmd=cmdInput.value.trim()
        cmdInput.value=''
        if(tmpCmd.length>0){
            this.cmd=tmpCmd
        }
        const {cmd}=this
        const itemEle=document.createElement('div')
        const descEle=document.createElement('div')
        descEle.textContent=`${getDate()}  ${cmd}`
        const contentEle=document.createElement('div')
        contentEle.textContent='executing'
        descEle.classList.add('desc')
        contentEle.classList.add('content')
        itemEle.classList.add('item')
        itemEle.append(descEle)
        itemEle.append(contentEle)
        console.prepend(itemEle)
        const result=await this.basicallyExec(cmd)
        if(result instanceof Error){
            contentEle.textContent='Error. '+result.message
            itemEle.classList.add('err')
            return
        }
        if(typeof result==='string'){
            contentEle.textContent=result
            return
        }
        contentEle.textContent=''
        contentEle.append(result)
    }
    async basicallyExec(cmd:string){
        const {password,token}=this
        if(password.length===0||token.length===0)return new Error('401.')
        if(cmd.startsWith('ids')){
            const start=Number(cmd.slice(3))
            if(isNaN(start))return new Error('Invalid cmd.')
            const data=await getIds(start,token,password)
            if(data===401){
                this.token=''
                this.password=''
            }
            if(typeof data==='number')return new Error(`${data}. Fail to get ids.`)
            return paintIds(data)
        }
        if(cmd.startsWith('cids')){
            const start=Number(cmd.slice(4))
            if(isNaN(start))return new Error('Invalid cmd.')
            const data=await getCIds(start,token,password)
            if(data===401){
                this.token=''
                this.password=''
            }
            if(typeof data==='number')return new Error(`${data}. Fail to get cids.`)
            return paintIds(data)
        }
        if(cmd.startsWith('rids')){
            const start=Number(cmd.slice(4))
            if(isNaN(start))return new Error('Invalid cmd.')
            const data=await getIds(start,token,password)
            if(data===401){
                this.token=''
                this.password=''
            }
            if(typeof data==='number')return new Error(`${data}. Fail to get ids.`)
            return idsToRIds(data,start)
        }
        if(cmd.startsWith('rcids')){
            const start=Number(cmd.slice(5))
            if(isNaN(start))return new Error('Invalid cmd.')
            const data=await getCIds(start,token,password)
            if(data===401){
                this.token=''
                this.password=''
            }
            if(typeof data==='number')return new Error(`${data}. Fail to get cids.`)
            return idsToRIds(data,start)
        }
        if(cmd==='info'){
            const data=await getInfo(token,password)
            if(data===401){
                this.token=''
                this.password=''
            }
            if(typeof data==='number')return new Error(`${data}. Fail to get info.`)
            const {maxId,maxCId}=data
            return `max-id ${maxId}, max-cid ${maxCId}`
        }
        return new Error('Invalid cmd.')
    }
}
function getDate(){
    const date=new Date()
    return [date.getMonth()+1,date.getDate()].map(val=>val.toString().padStart(2,'0')).join('-')+' '+[date.getHours(),date.getMinutes(),date.getSeconds()].map(val=>val.toString().padStart(2,'0')).join(':')+':'+date.getMilliseconds().toString().padStart(3,'0')
}
function paintIds(data:number[]){
    const batchSize=10000
    const width=100
    const height=batchSize/width
    const subWidth=width/10
    const subHeight=height/10
    const scale=10
    const canvas=document.createElement('canvas')
    canvas.width=width*scale
    canvas.height=height*scale
    canvas.classList.add('idsDensityView')
    const ctx=canvas.getContext('2d')
    if(ctx===null)throw new Error()
    ctx.scale(scale,scale)
    ctx.fillStyle='rgb(30,30,30)'
    data=data.map(val=>val%batchSize+1)
    for(let i=0;i<data.length;i++){
        const n=data[i]-1
        const x=n%width
        const y=(n-x)/width
        ctx.fillRect(x,y,1,1)
    }
    ctx.fillStyle='grey'
    for(let i=0;i<10;i++){
        const y=i*subHeight+(subHeight-0.1)
        const x=i*subWidth+(subWidth-0.1)
        ctx.fillRect(0,y,width,0.1)
        ctx.fillRect(x,0,0.1,height)
    }
    return canvas
}
function idsToRIds(data:number[],start:number){
    const batchSize=10000
    data=data.map(val=>val%batchSize)
    start*=batchSize
    const ids:Record<number,boolean>={}
    for(let i=0;i<data.length;i++){
        ids[data[i]]=true
    }
    let s=0
    const array:{s:number,e:number}[]=[]
    for(let i=0;i<batchSize;i++){
        if(!ids[i])continue
        if(s===i){
            s++
            continue
        }
        array.push({
            s:start+s,
            e:start+i-1
        })
        s=i+1
    }
    if(s!==batchSize){
        array.push({
            s:start+s,
            e:start+batchSize-1
        })
    }
    return array.map(val=>{
        const {s,e}=val
        if(s===e)return `#${s}`
        return `#${s}-${e}`
    }).join(' ')
}