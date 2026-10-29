# Construit assets/sacha.png + sacha.json à partir des GIF de assets/src (python3 assets/src/build_sacha.py)
from PIL import Image, ImageOps
import json, os
os.chdir(os.path.join(os.path.dirname(__file__), '..', '..'))
def frames(p):
  im=Image.open(p); out=[]
  for i in range(im.n_frames): im.seek(i); out.append(im.convert('RGBA'))
  return out
def cycle(fs, bottom):  # recadre en 48×48, pieds en bas, centre commun à tout le cycle (pas de tremblement)
  cx=round(sum((f.getbbox()[0]+f.getbbox()[2])/2 for f in fs)/len(fs))
  return [f.crop((cx-24, bottom-46, cx+24, bottom+2)) for f in fs]
T=[f.crop((0,0,48,46)) for f in frames('assets/src/sacha_turnaround.gif')]
walks={'down':cycle(frames('assets/src/sacha_walk_down.gif'),56)}
walks['right']=cycle(frames('assets/src/sacha_walk_right.gif'),53)
walks['left']=[ImageOps.mirror(f) for f in walks['right']]
walks['up']=cycle(frames('assets/src/sacha_walk_up.gif'),54)
walks['up_right']=cycle(frames('assets/src/sacha_walk_up_right.gif'),54)
walks['up_left']=[ImageOps.mirror(f) for f in walks['up_right']]
W,Hh=48,48; rows=[]
for d,i in [('down',0),('up',4),('left',6),('right',2),('down_right',1),('up_right',3),('up_left',5),('down_left',7)]:
  pose=Image.new('RGBA',(W,Hh)); pose.paste(T[i],(0,2)); bob=Image.new('RGBA',(W,Hh)); bob.paste(T[i],(0,1))
  rows.append((d,pose,walks.get(d,[pose,bob])))
cols=max(1+len(w) for _,_,w in rows)
sheet=Image.new('RGBA',(W*cols,Hh*len(rows))); fr={}; tags=[]; n=0
for r,(d,pose,walk) in enumerate(rows):
  sheet.paste(pose,(0,r*Hh)); fr[f'idle_{d}0']={'frame':{'x':0,'y':r*Hh,'w':W,'h':Hh},'duration':400}
  tags.append({'name':f'idle_{d}','from':n,'to':n,'direction':'forward'}); n+=1
  for j,f in enumerate(walk):
    sheet.paste(f,((j+1)*W,r*Hh)); fr[f'walk_{d}{j}']={'frame':{'x':(j+1)*W,'y':r*Hh,'w':W,'h':Hh},'duration':120 if len(walk)>2 else 140}
  tags.append({'name':f'walk_{d}','from':n,'to':n+len(walk)-1,'direction':'forward'}); n+=len(walk)
sheet.save('assets/sacha.png')
json.dump({'frames':fr,'meta':{'image':'sacha.png','size':{'w':sheet.width,'h':sheet.height},'scale':'1.4','frameTags':tags}},open('assets/sacha.json','w'),indent=1)
