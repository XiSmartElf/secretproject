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

x = [];
y = [];

x2 = [];
y2 = [];

time = [];
value = [];

for name, detail in snapshot2['asset'].items():
    #print(name+' '+ str(detail['totalVal']))
    x2.append(name)
    y2.append(detail['totalVal'])

for name, detail in snapshot['asset'].items():
    #print(name+' '+ str(detail['totalVal']))
    x.append(name)
    y.append(detail['totalVal'])
    time.append(snapshot['timestamp'])
    value.append(detail['totalVal'])

    # t = np.arange(50., 100., 0.2)
    # t2 = np.arange(0., 100., 0.2)
    # #plt.plot(snapshot['timestamp'], detail['totalVal'], 'r--')
    # plt.plot(t, t2, 'r--')
    # ++c

negIndexes = [];
percents = [];

for i in range(len(x)):
    percents.append(str((y2[i]-y[i])/y[i]*100)+'%')
    print(x[i]+' : '+str(round((y2[i]-y[i])/y[i]*100, 2))+'%')
    if y[i] > y2[i]:
        negIndexes.append(i)
        temp = y[i]
        y[i] = y2[i]
        y2[i] = temp
        


plt.figure(1)
plt.title('detail')
chart2 = plt.bar(x2, y2, width=0.8, label='current asset values', color='b')
chart1 = plt.bar(x, y, width=0.8, label='previous asset values', color='r')
for i in negIndexes:
    chart2[i].set_color('r')
    chart1[i].set_color('grey')

plt.ylabel('profolio snapshot')
plt.xlabel('asset')

plt.figure(2)
# plt.plot(t, t, 'r--')
# plt.plot(t, t**2, 'bs', t, t**3, 'g^')
plt.scatter(time, value)
plt.ylabel('value')
plt.xlabel('time')

plt.legend();
plt.show()

sys.stdout.flush()
