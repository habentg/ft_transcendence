#!/usr/bin/env python3
import subprocess
import re
import platform
from pathlib import Path

def get_network_ip():
    system = platform.system()
    
    try:
        if system == "Darwin":
            cmd = ['/sbin/ifconfig', 'en0']
            pattern = r'inet (\d+\.\d+\.\d+\.\d+)'
        elif system == "Linux":
            cmd = ['ip', 'addr', 'show']
            pattern = r'inet (\d+\.\d+\.\d+\.\d+).*global'
        else:
            return 'localhost'

        output = subprocess.check_output(cmd).decode('utf-8')
        ip_match = re.search(pattern, output)
        
        if ip_match:
            return ip_match.group(1)
        return 'localhost'
        
    except subprocess.CalledProcessError as e:
        return 'localhost'
    except Exception as e:
        return 'localhost'

def update_env_file(ip_address):
    """Append LOCAL_IP to .env file"""
    env_path = Path('.env')
    
    # First remove any existing LOCAL_IP line if it exists
    if env_path.exists():
        with open(env_path, 'r') as f:
            lines = [line for line in f if not line.startswith('LOCAL_IP=')]
    else:
        lines = []

    # Append the new LOCAL_IP
    with open(env_path, 'w') as f:
        f.writelines(lines)
        if lines and not lines[-1].endswith('\n'):
            f.write('\n')  # Ensure there's a newline before appending
        f.write(f'LOCAL_IP={ip_address}\n')


ip_address = get_network_ip()
update_env_file(ip_address)
