#my first public tool ;D
#vouches / suggestions or whatever => https://discord.gg/Y484M6FZxg
import customtkinter as ctk
import os
import sys
import ctypes
import random
import string
import customtkinter as ctk
import winreg as reg
import json
import subprocess

BACKUP_FILE = "og_elements.txt"

packages = [           
    "customtkinter"
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
    
def is_admin():
    try:
        return ctypes.windll.shell32.IsUserAnAdmin()
    except:
        return False

def run_as_admin():
    try:
        ctypes.windll.shell32.ShellExecuteW(
            None, "runas", sys.executable, " ".join(sys.argv), None, 1
        )
        sys.exit(0)
    except Exception as e:
        print(f"[-] Error: Unable to restart as administrator. {e}")
        sys.exit(1)

def hide_console():
    whnd = ctypes.windll.kernel32.GetConsoleWindow()
    if whnd != 0:
        ctypes.windll.user32.ShowWindow(whnd, 0)

class luxinferni666(ctk.CTk):
    def __init__(self):
        super().__init__()

        self.title("ez spoofer | dc: luxinferni")
        self.geometry("500x600")
        self.configure(bg="black")
        #self.iconbitmap("unt\\testing\\luxinferni.jpg") -replace with your png path 
        # optional ^^

        self.setup_ui()

    def setup_ui(self):
        frame = ctk.CTkFrame(self)
        frame.pack(pady=5, padx=5, fill="both", expand=True)

        label_title = ctk.CTkLabel(frame, text="ｏｐｔｉｏｎｓ:", font=("Yu Gothic", 20), text_color="magenta")
        label_title.pack(pady=(0, 20))

        button_save_original = ctk.CTkButton(frame, text="Save HWID & GUID", fg_color="violet", hover_color="magenta", text_color="black",  font=("Yu Gothic", 12), command=self.save_original_values)
        button_save_original.pack(pady=10)

        button_spoof_guid = ctk.CTkButton(frame, text="GUID Spoofer", fg_color="violet", hover_color="magenta", text_color="black",  font=("Yu Gothic", 12), command=self.spoof_machine_guid)
        button_spoof_guid.pack(pady=10)

        button_spoof_hwid = ctk.CTkButton(frame, text="HWID Spoofer", fg_color="violet", hover_color="magenta", text_color="black",  font=("Yu Gothic", 12), command=self.spoof_hwid)
        button_spoof_hwid.pack(pady=10)

        button_reset_all = ctk.CTkButton(frame, text="Restore HWID & GUID", fg_color="violet", hover_color="magenta", text_color="black",  font=("Yu Gothic", 12), command=self.reset_all)
        button_reset_all.pack(pady=10)

        button_spoof_mac = ctk.CTkButton(frame, text="MAC Spoofer", fg_color="violet", hover_color="magenta", text_color="black",   font=("Yu Gothic", 12), command=self.spoof_mac_address)
        button_spoof_mac.pack(pady=10)

        button_restore_mac = ctk.CTkButton(frame, text="Restore MAC", fg_color="violet", hover_color="magenta", text_color="black",  font=("Yu Gothic", 12), command=self.restore_mac)
        button_restore_mac.pack(pady=10)        #     ^^  added this as a separate button cuz mac is safe to spoof

        footer_label = ctk.CTkLabel(frame, text="２０２４ © ｌｕｘｉｎｆｅｒｎｉ", text_color="magenta", font=("Yu Gothic", 12, "bold"), cursor="hand2")
        footer_label.pack(pady=20)
    
        self.output_text = ctk.CTkTextbox(frame, text_color="magenta", height=200, width=560)
        self.output_text.pack(pady=5, padx=10)
        self.columnconfigure(0, weight=1)
        self.rowconfigure(0, weight=1)

    # - GENERATING RANDOM VALUES FOR ELEMENTS
    def random_serial(self):
        return ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))

    def random_hwid(self):
        return ''.join(random.choices(string.hexdigits[:16], k=16))

    def random_mac(self):
        mac = [0x00, 0x16, 0x3E, random.randint(0x00, 0x7F), random.randint(0x00, 0xFF), random.randint(0x00, 0xFF)]
        return ':'.join(map(lambda x: "%02x" % x, mac))
    

    # - GETTING CURRENT GUID
    def get_current_machine_guid(self):
        try:
            key = reg.OpenKey(reg.HKEY_LOCAL_MACHINE, r"SOFTWARE\Microsoft\Cryptography", 0, reg.KEY_READ)
            value, _ = reg.QueryValueEx(key, "MachineGuid")
            reg.CloseKey(key)
            return value
        except Exception as e:
            return None

    # - GETTING CURRENT HWID
    def get_current_hwid(self):
        try:
            key = reg.OpenKey(reg.HKEY_LOCAL_MACHINE, r"SYSTEM\CurrentControlSet\Control\IDConfigDB\Hardware Profiles\0001", 0, reg.KEY_READ)
            value, _ = reg.QueryValueEx(key, "HwProfileGuid")
            reg.CloseKey(key)
            return value
        except Exception as e:
            return None
        
    # - GETTING CURRENT MACS
    def get_current_mac(self):
        try:
            interfaces = os.popen("getmac").read().splitlines()
            mac_addresses = []
            for line in interfaces:
                if line and line[0].isalnum() and '-' in line:
                    mac_addresses.append(line.split()[0])
            return mac_addresses
        except Exception:
            return None
        
    # - saving them into a txt file if any instabilities show up, you never know tbh
    def save_original_values(self):
        try:
            hwid = self.get_current_hwid()
            guid = self.get_current_machine_guid()
            macs = self.get_current_mac()
            if hwid and guid and macs:
                with open(BACKUP_FILE, "w") as f:
                    json.dump({"hwid": hwid, "guid": guid, "macs": macs}, f)
                self.output_text.insert("end", f"[+] Original values saved to {BACKUP_FILE}\n")
            else:
                self.output_text.insert("end", "[-] Unable to save values.\n")
        except Exception as e:
            self.output_text.insert("end", f"[-] Error saving original values: {e}\n")

    # - the actual magic of spoofing elements 
    def spoof_machine_guid(self):
        new_guid = ''.join(random.choices(string.hexdigits[:16], k=32))
        try:
            reg_command = f'reg add "HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Cryptography" /v MachineGuid /t REG_SZ /d {new_guid} /f'
            os.system(reg_command)
            self.output_text.insert("end", f"[+] Machine GUID spoofed to: {new_guid}\n")
        except Exception as e:
            self.output_text.insert("end", f"[-] Error spoofing Machine GUID: {e}\n")

    def spoof_hwid(self):
        new_hwid = ''.join(random.choices(string.hexdigits[:16], k=16))
        try:
            reg_command = f'reg add "HKEY_LOCAL_MACHINE\\SYSTEM\\CurrentControlSet\\Control\\IDConfigDB\\Hardware Profiles\\0001" /v HwProfileGuid /t REG_SZ /d {new_hwid} /f'
            os.system(reg_command)
            self.output_text.insert("end", f"[+] HWID spoofed to: {new_hwid}\n")
        except Exception as e:
            self.output_text.insert("end", f"[-] Error spoofing HWID: {e}\n")

    def spoof_mac_address(self):
        new_mac = self.random_mac()
        try:
            reg_command = f'reg add "HKEY_LOCAL_MACHINE\\SYSTEM\\CurrentControlSet\\Control\\Class\\{{4d36e972-e325-11ce-bfc1-08002be10318}}\\0001" /v NetworkAddress /t REG_SZ /d {new_mac} /f'
            os.system(reg_command)
            self.output_text.insert("end", f"[+] MAC Address spoofed to: {new_mac}\n")
        except Exception as e:
            self.output_text.insert("end", f"[-] Error spoofing MAC Address: {e}\n")
    
    # - restoring pc elements
    def restore_mac(self):
        try:
            if os.path.exists(BACKUP_FILE):
                with open(BACKUP_FILE, "r") as f:
                    data = json.load(f)
                    original_macs = data.get("macs")

                    if original_macs:
                        for mac in original_macs:
                            reg_command = f'reg delete "HKEY_LOCAL_MACHINE\\SYSTEM\\CurrentControlSet\\Control\\Class\\{{4d36e972-e325-11ce-bfc1-08002be10318}}\\0001" /v NetworkAddress /f'
                            os.system(reg_command)
                        self.output_text.insert("end", "[+] MAC Addresses reset to original values.\n")
                    else:
                        self.output_text.insert("end", "[-] No original MAC addresses found in backup.\n")
            else:
                self.output_text.insert("end", "[-] Backup file not found. Unable to reset MAC(s).\n")
        except Exception as e:
            self.output_text.insert("end", f"[-] Error restoring MAC(s): {e}\n")

    def reset_all(self):
        try:
            if os.path.exists(BACKUP_FILE):
                with open(BACKUP_FILE, "r") as f:
                    data = json.load(f)
                    original_hwid = data.get("hwid")
                    original_guid = data.get("guid")

                    if original_guid:
                        reg_command = f'reg add "HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Cryptography" /v MachineGuid /t REG_SZ /d {original_guid} /f'
                        os.system(reg_command)
                        self.output_text.insert("end", "[+] GUID reset to original value.\n")

                    if original_hwid:
                        reg_command = f'reg add "HKEY_LOCAL_MACHINE\\SYSTEM\\CurrentControlSet\\Control\\IDConfigDB\\Hardware Profiles\\0001" /v HwProfileGuid /t REG_SZ /d {original_hwid} /f'
                        os.system(reg_command)
                        self.output_text.insert("end", "[+] HWID reset to original value.\n")

            else:
                self.output_text.insert("end", "[-] Backup file not found. Unable to reset GUID, HWID, or MAC(s).\n")
        except Exception as e:
            self.output_text.insert("end", f"[-] Error resetting values: {e}\n")

if __name__ == "__main__":
    if not is_admin():
        run_as_admin()
    install_pkgs()
    hide_console()
    app = luxinferni666()
    app.mainloop()
