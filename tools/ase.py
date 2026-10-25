import struct, zlib, sys
from PIL import Image
def read_ase(path):
    d=open(path,'rb').read()
    size,magic,nframes,w,h,depth,flags,speed=struct.unpack_from('<IHHHHHIH',d,0)
    assert magic==0xA5E0
    transp=d[28]
    pos=128; frames=[]; layers=[]; palette=[(0,0,0,0)]*256; tags=[]
    for fi in range(nframes):
        fbytes,fm,oldc,dur=struct.unpack_from('<IHHH',d,pos); newc=struct.unpack_from('<I',d,pos+12)[0]
        nchunks=newc if newc else oldc; p=pos+16; cels=[]
        for _ in range(nchunks):
            csz,ctype=struct.unpack_from('<IH',d,p); body=d[p+6:p+csz]
            if ctype==0x2004:
                lf,lt,lvl,_,_,blend,op=struct.unpack_from('<HHHHHHB',body,0)
                nl=struct.unpack_from('<H',body,16)[0]; name=body[18:18+nl].decode('utf8','replace')
                layers.append(dict(flags=lf,type=lt,blend=blend,opacity=op,name=name))
            elif ctype==0x2019:
                n,first,last=struct.unpack_from('<III',body,0); q=20
                for i in range(first,last+1):
                    ef,r,g,b,a=struct.unpack_from('<HBBBB',body,q); q+=6
                    if ef&1: nl=struct.unpack_from('<H',body,q)[0]; q+=2+nl
                    palette[i]=(r,g,b,a)
            elif ctype==0x0004 and all(c==(0,0,0,0) for c in palette[:4]):
                np_=struct.unpack_from('<H',body,0)[0]; q=2; idx=0
                for _ in range(np_):
                    skip,cnt=body[q],body[q+1]; q+=2; idx+=skip; cnt=cnt or 256
                    for i in range(cnt): palette[idx]=(body[q],body[q+1],body[q+2],255); q+=3; idx+=1
            elif ctype==0x2005:
                li,x,y,op,ct=struct.unpack_from('<HhhBH',body,0); z=struct.unpack_from('<h',body,9)[0]; q=16
                if ct==1: cels.append(dict(layer=li,link=struct.unpack_from('<H',body,q)[0],x=x,y=y,op=op))
                else:
                    cw,ch=struct.unpack_from('<HH',body,q); raw=body[q+4:]
                    if ct==2: raw=zlib.decompress(raw)
                    cels.append(dict(layer=li,x=x,y=y,op=op,w=cw,h=ch,data=raw))
            elif ctype==0x2018:
                nt=struct.unpack_from('<H',body,0)[0]; q=10
                for _ in range(nt):
                    fr,to,dirn=struct.unpack_from('<HHB',body,q); q+=17; nl=struct.unpack_from('<H',body,q)[0]
                    tags.append(dict(name=body[q+2:q+2+nl].decode(),fr=fr,to=to)); q+=2+nl
            p+=csz
        frames.append(dict(dur=dur,cels=cels)); pos+=fbytes
    bpp=depth//8
    def cel_img(c):
        im=Image.new('RGBA',(c['w'],c['h']))
        px=[]
        dd=c['data']
        for i in range(c['w']*c['h']):
            if bpp==4: px.append(tuple(dd[i*4:i*4+4]))
            elif bpp==2: v,a=dd[i*2],dd[i*2+1]; px.append((v,v,v,a))
            else:
                ix=dd[i]; px.append((0,0,0,0) if ix==transp else palette[ix])
        im.putdata(px); return im
    out=[]
    for fi,f in enumerate(frames):
        canvas=Image.new('RGBA',(w,h))
        cmap={c['layer']:c for c in f['cels']}
        for li,L in enumerate(layers):
            if L['type']!=0 or not (L['flags']&1) or li not in cmap: continue
            c=cmap[li]
            if 'link' in c: c=dict({k:v for k,v in [cc for cc in frames[c['link']]['cels'] if cc['layer']==li][0].items()})
            im=cel_img(c)
            if c['op']<255 or L['opacity']<255:
                a=im.getchannel('A').point(lambda v: v*c['op']*L['opacity']//(255*255)); im.putalpha(a)
            canvas.alpha_composite(im,(c['x'],c['y']))
        out.append((canvas,f['dur']))
    return dict(w=w,h=h,depth=depth,frames=out,layers=layers,tags=tags)
if __name__=='__main__':
    for pth in sys.argv[1:]:
        a=read_ase(pth); print(pth.split('/')[-1], a['w'],a['h'],'bpp',a['depth'],'frames',len(a['frames']),[f[1] for f in a['frames']],'layers',[(l['name'],l['flags']&1) for l in a['layers']],'tags',a['tags'])
