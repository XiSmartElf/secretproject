import sys 
import matplotlib.pyplot as plt
import json
import numpy as np

# jsonToPython = json.loads(sys.argv[1])
print(sys.argv[1])

file  = open("C:/Users/superxi/secret/secretproject/node/pricesSnapshots/1", "r") 
file2  = open("C:/Users/superxi/secret/secretproject/node/pricesSnapshots/"+sys.argv[1], "r") 
data = file.read();
data2 = file2.read();
file.close();
file2.close();
snapshot = json.loads(data)
snapshot2 = json.loads(data2)
print(snapshot['totalVal'])
print(snapshot2['totalVal'])

c = 10;

profolio = {};
x1 = [];
y1 = [];

x2 = [];
y2 = [];

# time = [];
# value = [];

for name, detail in snapshot2['asset'].items():
    profolio[name] = {}
    profolio[name]['snap2'] = detail

for name, detail in snapshot['asset'].items():
    if profolio.get(name) is None:
        continue
    profolio[name]['snap1'] = detail
    # t = np.arange(50., 100., 0.2)
    # t2 = np.arange(0., 100., 0.2)
    # #plt.plot(snapshot['timestamp'], detail['totalVal'], 'r--')
    # plt.plot(t, t2, 'r--')

negIndexes = [];
percents = [];

for name, snaps in profolio.items():
    snap1 = snaps.get('snap1')
    snap2 = snaps['snap2']
    x1.append(name);
    x2.append(name);

    if snap1 is None:
        y1.append(snap2['totalVal'])
        y2.append(snap2['totalVal'])
        continue

    if float(snap1['units'])!=float(snap2['units']):
        y1.append(snap2['totalVal'])
        y2.append(snap2['totalVal'])
        #y2.append(snap2['units']*snap1['unit_price'])
        continue #handle BTC case
    
    #percents.append(str((snap2['totalVal']-snap1['totalVal'])/snap1['totalVal']*100)+'%')
    print(name+' : '+str((snap2['totalVal']-snap1['totalVal'])/snap1['totalVal']*100)+'%')
    if snap1['totalVal'] > snap2['totalVal']:
        y2.append(snap1['totalVal'])
        y1.append(snap2['totalVal'])
        negIndexes.append(len(y1)-1)
        # temp = y[i]
        # y[i] = y2[i]
        # y2[i] = temp
    else:
        y1.append(snap1['totalVal'])
        y2.append(snap2['totalVal'])
        

plt.figure(1)
plt.title('detail')
chart2 = plt.bar(x2, y2, width=0.8, label='current asset values', color='b')
chart1 = plt.bar(x1, y1, width=0.8, label='previous asset values', color='r')
for i in negIndexes:
    chart2[i].set_color('r')
    chart1[i].set_color('grey')

plt.ylabel('profolio snapshot')
plt.xlabel('asset')

# plt.figure(2)
# plt.plot(t, t, 'r--')
# plt.plot(t, t**2, 'bs', t, t**3, 'g^')
# plt.scatter(time, value)
# plt.ylabel('value')
# plt.xlabel('time')

plt.legend();
plt.show()

sys.stdout.flush()
