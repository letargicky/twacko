import requests
import os
import colorama
from colorama import Fore as F, Style, init
import subprocess
import sys
colorama.init(autoreset=True)
 
lm = F.LIGHTMAGENTA_EX
m = F.MAGENTA
r = F.RESET

packages = [
    colorama
]
def install_pkgs():
    try:
        print(f"\n\n\n > Installing dependencies...")  
        os.system('cls')
        for package in packages:
            try:
                __import__(package)
            except ImportError:
                subprocess.check_call([sys.executable, "-m", "pip", "install", package])
    finally: # - after all the packages are installed
        print(f"\r... All depencies were installed sucessfully.") 
        os.system('cls') 

os.system('cls' if os.name == 'nt' else 'clear')
os.system(f"title webhook spammer | dc: luxinferni")

print(f"""
                  .                   .:                                                               
                  .'    .;              ::                                                               
`;     .- .-.    ;-.    ;;-. .-.   .-.  ;;.-.       .`..:.  .-.    . ,';.,';.   . ,';.,';.  .-.   .;.::. 
;  ;   ;.;.-'   ;   ;  ;;  ;;   ;';   ;';; .'     .'; ;;  :;   :   ;;  ;;  ;;   ;;  ;;  ;;.;.-'   .;     
`.' `.'  `:::'.'`::'`-.;`  ``;;'  `;;'_.'`  `.  .' .' ;;_.``:::'-'';  ;;  ';   ';  ;;  ';  `:::'.;'      
                                               '     .;'         _;        `-'_;        `-'         

""")
webhook_url = input(f" {m}> {r}Webhook . {lm}")
message = input(f" {m}> {r}Message . {lm}")
count = int(input(f" {m}> {r}Count . {lm}"))

for i in range(count):
    try:
        data = {
            "content": message
        }
        response = requests.post(webhook_url, json=data)

        if response.status_code == 204:
            print(f" [{m}+{r}] Message sent successfully ({i + 1}/{count})!")
        else:
            print(f"[{m}-{r}] Failed to send message ({i + 1}/{count}): {response.status_code} - {response.text}")

    except requests.exceptions.RequestException as e:
        print(f"[[{m}!!!{r}]] ERROR {lm}{e}{r}")

input(f"[[{m}!!!{r}]] Press enter to exit :D")
