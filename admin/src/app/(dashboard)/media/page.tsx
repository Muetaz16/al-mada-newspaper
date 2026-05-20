'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Upload, 
  Search, 
  Image as ImageIcon, 
  Video, 
  Mic2, 
  MoreVertical, 
  Copy, 
  Trash2,
  FileText
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const mockMedia = [
  { id: '1', type: 'IMAGE', title: 'خلفية الخبر', url: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=300&h=200', date: '14 مايو' },
  { id: '2', type: 'VIDEO', title: 'تقرير المدن', url: '#', date: '13 مايو' },
  { id: '3', type: 'IMAGE', title: 'آثار الأقصر', url: 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&q=80&w=300&h=200', date: '12 مايو' },
];

export default function MediaPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">المكتبة الإعلامية</h2>
        <Button>
          <Upload className="ml-2 h-4 w-4" />
          رفع ملفات جديدة
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="البحث في الوسائط..." className="pr-9" />
        </div>
        <Tabs defaultValue="all" className="w-[400px]">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">الكل</TabsTrigger>
            <TabsTrigger value="images">صور</TabsTrigger>
            <TabsTrigger value="videos">فيديو</TabsTrigger>
            <TabsTrigger value="audio">صوت</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {mockMedia.map((item) => (
          <Card key={item.id} className="group relative overflow-hidden border-none bg-muted/50">
            <CardContent className="p-0 aspect-square flex items-center justify-center relative">
              {item.type === 'IMAGE' ? (
                <img 
                  src={item.url} 
                  alt={item.title} 
                  className="w-full h-full object-cover transition-transform group-hover:scale-105" 
                />
              ) : item.type === 'VIDEO' ? (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <Video className="h-10 w-10" />
                  <span className="text-xs">فيديو</span>
                </div>
              ) : (
                <Mic2 className="h-10 w-10 text-muted-foreground" />
              )}
              
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-start justify-end p-2">
                <DropdownMenu>
                  <DropdownMenuTrigger render={
                    <Button variant="secondary" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  } />
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Copy className="ml-2 h-4 w-4" />
                      نسخ الرابط
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">
                      <Trash2 className="ml-2 h-4 w-4" />
                      حذف
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
            <div className="p-2 text-xs truncate font-medium">
              {item.title}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
