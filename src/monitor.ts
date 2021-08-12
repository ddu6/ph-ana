import {CommonEle, Div, Shell} from '@ddu6/stui'
import {all} from './lib/css'
import {getIds,getCIds, getInfo} from './get'
export class Monitor extends Shell{
    input=new CommonEle('input')
    password=''
    constructor(){
        super('PKU Holes Monitor','https://pkuh6.github.io/imgs/pkuh-circle.png',all,['monitor','form'])
        this.append(this.input)
        this.password=localStorage.getItem('ph-password')??''
        document.documentElement.dataset.colorScheme
        =localStorage.getItem('ph-color-scheme')
        ??document.documentElement.dataset.colorScheme
        ??'auto'
        document.documentElement.dataset.fontSize
        =localStorage.getItem('ph-font-size')
        ??document.documentElement.dataset.fontSize
        ??'small'
        addEventListener('keydown',async e=>{
            if(e.key==='Enter'){
                await this.exec()
            }
        })
    }
    async exec(){
        if(this.password.length===0){
            return
        }
        const cmd=this.input.element.value.trim()
        this.input.element.value=''
        if(cmd.length===0){
            return
        }
        const name=cmd.replace(/[^a-z].*$/,'')
        const number=Number(cmd.slice(name.length))
        if(!isFinite(number)){
            return
        }
        const content=new Div()
        .setText('executing')
        this.input.after(
            new Div()
            .setText(`${getDate()}  ${cmd}`)
            .append(content)
        )
        if(name==='info'){
            const data=await getInfo(this.password)
            if(typeof data==='number'){
                content.setText(`${data}`)
                return
            }
            const {maxId,maxCId}=data
            content.setText(`max-id ${maxId}, max-cid ${maxCId}`)
            return
        }
        if(name==='ids'||name===''){
            const data=await getIds(number,this.password)
            if(typeof data==='number'){
                content.setText(`${data}`)
                return
            }
            content
            .setHTML('')
            .append(paintIds(data))
            return
        }
        if(name==='cids'){
            const data=await getCIds(number,this.password)
            if(typeof data==='number'){
                content.setText(`${data}`)
                return
            }
            content
            .setHTML('')
            .append(paintIds(data))
            return
        }
        if(name==='rids'){
            const data=await getIds(number,this.password)
            if(typeof data==='number'){
                content.setText(`${data}`)
                return
            }
            content.setText(idsToRIds(data,number))
            return
        }
        if(name==='rcids'){
            const data=await getCIds(number,this.password)
            if(typeof data==='number'){
                content.setText(`${data}`)
                return
            }
            content.setText(idsToRIds(data,number))
            return
        }
    }
}
function getDate(){
    const date=new Date()
    return [
        date.getMonth()+1,
        date.getDate()
    ]
    .map(val=>val.toString().padStart(2,'0'))
    .join('-')
    +' '
    +[
        date.getHours(),date.getMinutes(),
        date.getSeconds()
    ]
    .map(val=>val.toString().padStart(2,'0'))
    .join(':')
    +':'
    +date.getMilliseconds().toString().padStart(3,'0')
}
function paintIds(data:number[]){
    const batchSize=10000
    const width=100
    const height=batchSize/width
    const subWidth=width/10
    const subHeight=height/10
    const scale=10
    const canvas=document.createElement('canvas')
    canvas.width=(width+0.2)*scale
    canvas.height=(height+0.2)*scale
    canvas.classList.add('density-view')
    const ctx=canvas.getContext('2d')
    if(ctx===null){
        throw new Error()
    }
    ctx.scale(scale,scale)
    const style=getComputedStyle(document.documentElement)
    ctx.fillStyle=style.getPropertyValue('--color-variable')
    for(const id of data){
        const n=id%batchSize
        const x=n%width
        ctx.fillRect(x+0.1,(n-x)/width+0.1,1,1)
    }
    ctx.fillStyle=style.getPropertyValue('--color-modifier')
    for(let i=0;i<=10;i++){
        ctx.fillRect(0,i*subHeight,width,0.2)
        ctx.fillRect(i*subWidth,0,0.2,height)
    }
    return canvas
}
function idsToRIds(data:number[],start:number){
    const batchSize=10000
    data=data.map(val=>val%batchSize)
    start*=batchSize
    const idSet:Record<number,true|undefined>={}
    for(const id of data){
        idSet[id]=true
    }
    let s=0
    const array:{s:number,e:number}[]=[]
    for(let i=0;i<batchSize;i++){
        if(!idSet[i]){
            continue
        }
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
        if(s===e){
            return `#${s}`
        }
        return `#${s}-${e}`
    }).join(' ')
}