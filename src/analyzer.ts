import {CommonEle, Div, Shell} from '@ddu6/stui'
import {all} from './lib/css'
import {getIds,getCIds, getInfo} from './get'
export class Analyzer extends Shell{
    input=new CommonEle('input')
    console=document.createElement('div')
    token=''
    password=''
    constructor(){
        super('PKU Holes Analyzer','https://pkuh6.github.io/imgs/pkuh-circle.png',all,['analyzer'])
        this.append(this.input)
        this.token=window.localStorage.getItem('ph-token')??''
        this.password=window.localStorage.getItem('ph-password')??''
        addEventListener('keydown',async e=>{
            if(e.key==='Enter'){
                await this.exec()
            }
        })
    }
    async exec(){
        if(this.token===''||this.password===''){
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
            const data=await getInfo(this.token,this.password)
            if(data===401){
                this.token=''
                this.password=''
            }
            if(typeof data==='number'){
                content.setText(`${data}`)
                return
            }
            const {maxId,maxCId}=data
            content.setText(`max-id ${maxId}, max-cid ${maxCId}`)
            return
        }
        if(name==='ids'||name===''){
            const data=await getIds(number,this.token,this.password)
            if(data===401){
                this.token=''
                this.password=''
            }
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
            const data=await getCIds(number,this.token,this.password)
            if(data===401){
                this.token=''
                this.password=''
            }
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
            const data=await getIds(number,this.token,this.password)
            if(data===401){
                this.token=''
                this.password=''
            }
            if(typeof data==='number'){
                content.setText(`${data}`)
                return
            }
            content.setText(idsToRIds(data,number))
            return
        }
        if(name==='rcids'){
            const data=await getCIds(number,this.token,this.password)
            if(data===401){
                this.token=''
                this.password=''
            }
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
    canvas.width=width*scale
    canvas.height=height*scale
    canvas.classList.add('density-view')
    const ctx=canvas.getContext('2d')
    if(ctx===null){
        throw new Error()
    }
    ctx.scale(scale,scale)
    ctx.fillStyle='#6ec0ec'
    data=data.map(val=>val%batchSize+1)
    for(let i=0;i<data.length;i++){
        const n=data[i]-1
        const x=n%width
        const y=(n-x)/width
        ctx.fillRect(x,y,1,1)
    }
    ctx.fillStyle='#3074ac'
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