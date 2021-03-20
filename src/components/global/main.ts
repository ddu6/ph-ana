import * as css from '../../lib/css'
import {getIds,getCIds, getInfo} from '../../funcs/get'
export class Main{
    element=document.createElement('div')
    style=document.createElement('style')
    cmdInput=document.createElement('input')
    console=document.createElement('div')
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

    }
    async exec(){
        const {cmdInput,console}=this
        const cmd=cmdInput.value.trim()
        cmdInput.value=''
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
        const result=await basicallyExec(cmd)
        if(result instanceof Error){
            contentEle.textContent='Error. '+result.message
            itemEle.classList.add('err')
            return
        }
        contentEle.textContent=''
        contentEle.append(result)
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
    data=data.map(val=>val%batchSize)
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
async function basicallyExec(cmd:string){
    if(cmd.startsWith('ids')){
        const start=Number(cmd.slice(3))
        if(isNaN(start))return new Error('Invalid cmd.')
        const data=await getIds(start)
        if(typeof data==='number')return new Error(`${data}. Fail to get ids.`)
        return paintIds(data)
    }
    if(cmd.startsWith('cids')){
        const start=Number(cmd.slice(4))
        if(isNaN(start))return new Error('Invalid cmd.')
        const data=await getCIds(start)
        if(typeof data==='number')return new Error(`${data}. Fail to get cids.`)
        return paintIds(data)
    }
    if(cmd==='info'){
        const data=await getInfo()
        if(typeof data==='number')return new Error(`${data}. Fail to get info.`)
        const {maxId,maxCId}=data
        const infoEle=document.createElement('div')
        infoEle.textContent=`max-id ${maxId}, max-cid ${maxCId}`
        return infoEle
    }
    return new Error('Invalid cmd.')
}