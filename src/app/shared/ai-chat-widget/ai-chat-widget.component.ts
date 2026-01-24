import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  AiAgentService,
  ChatApiResponse,
} from '../../services/ai-agent.service';

type Msg = {
  role: 'user' | 'bot';
  text: string;
  actions?: string[];
};

@Component({
  selector: 'app-ai-chat-widget',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ai-chat-widget.component.html',
  styleUrls: ['./ai-chat-widget.component.scss'],
})
export class AiChatWidgetComponent {
  open = false;
  input = '';
  loading = false;

  @ViewChild('chatBody') chatBody?: ElementRef<HTMLDivElement>;

  messages: Msg[] = [
    {
      role: 'bot',
      text: 'היי 👋 אני הסוכן של רועי. אפשר לשאול על פרויקטים, טכנולוגיות או יצירת קשר.',
      actions: ['פרויקטים מרכזיים', 'טכנולוגיות', 'יצירת קשר'],
    },
  ];

  constructor(private ai: AiAgentService) {}

  toggle() {
    this.open = !this.open;
    if (this.open) this.scrollSoon();
  }

  sendQuick(actionText: string) {
    if (this.loading) return;
    this.input = actionText;
    this.send();
  }

  send() {
    const text = this.input.trim();
    if (!text || this.loading) return;

    // הודעת משתמש
    this.messages.push({ role: 'user', text });
    this.input = '';
    this.loading = true;
    this.scrollSoon();

    this.ai.send(text).subscribe({
      next: (res: ChatApiResponse) => {
        this.messages.push({
          role: 'bot',
          text: res.reply,
          actions: res.actions?.length ? res.actions : undefined,
        });
        this.loading = false;
        this.scrollSoon();
      },
      error: () => {
        this.messages.push({
          role: 'bot',
          text: 'יש בעיה זמנית בחיבור. נסה שוב.',
          actions: ['פרויקטים מרכזיים', 'טכנולוגיות', 'יצירת קשר'],
        });
        this.loading = false;
        this.scrollSoon();
      },
    });
  }

  private scrollSoon() {
    setTimeout(() => this.scrollToBottom(), 0);
  }

  private scrollToBottom() {
    const el = this.chatBody?.nativeElement;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }
}
