import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RevealOnScrollDirective } from '../../shared/directives/reveal-on-scroll.directive';

interface NocSkillGroup {
  label: string;
  items: string[];
}

@Component({
  selector: 'app-noc',
  standalone: true,
  imports: [CommonModule, RevealOnScrollDirective],
  templateUrl: './noc.html',
  styleUrls: ['./noc.scss'],
})
export class Noc {
  skillGroups: NocSkillGroup[] = [
    {
      label: 'Networking',
      items: ['TCP/IP', 'DNS', 'DHCP', 'NAT', 'Routing', 'SNMP'],
    },
    {
      label: 'Monitoring',
      items: ['PRTG', 'Nagios', 'Zabbix', 'Alert Triage', 'Uptime Monitoring'],
    },
    {
      label: 'Systems',
      items: ['Linux (Ubuntu)', 'Windows', 'Firewall', 'systemctl', 'journalctl'],
    },
  ];

  commands: string[] = [
    'ping',
    'traceroute',
    'ss',
    'ip a',
    'ufw',
    'systemctl',
    'journalctl',
    'uptime',
    'free',
    'df',
  ];

  incidentFlow: string[] = [
    'Detection',
    'Triage',
    'Root Cause',
    'Resolution',
    'Documentation',
  ];

  highlights: string[] = [
    'Built and maintained a production-style Linux NOC lab (Ubuntu + VirtualBox), simulating real datacenter incidents.',
    'Simulated and resolved DNS failures, blocked ports, crashed services, and performance degradation within simulated SLA timeframes.',
    'Diagnosed connectivity issues using ping/traceroute; investigated failed services end-to-end with systemctl and journalctl.',
    'Continuously monitored CPU, memory, and disk; opened and secured services on custom ports, including a Python server on port 8080.',
  ];
}
