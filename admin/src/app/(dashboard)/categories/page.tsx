'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  Search,
  Pencil,
  Trash2,
  Loader2,
  Tag
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [nameAr, setNameAr] = useState('');
  const [slug, setSlug] = useState('');
  
  const supabase = createClient();

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    setLoading(true);
    const { data } = await supabase.from('categories').select('*').order('name_ar');
    if (data) setCategories(data);
    setLoading(false);
  }

  const handleEdit = (category: any) => {
    setEditingCategory(category);
    setNameAr(category.name_ar);
    setSlug(category.slug);
    setOpen(true);
  };

  const handleCreate = () => {
    setEditingCategory(null);
    setNameAr('');
    setSlug('');
    setOpen(true);
  };

  const saveCategory = async () => {
    if (!nameAr || !slug) return;
    setSaving(true);

    if (editingCategory) {
      await supabase.from('categories').update({ name_ar: nameAr, slug }).eq('id', editingCategory.id);
    } else {
      await supabase.from('categories').insert({ name_ar: nameAr, slug });
    }

    setOpen(false);
    setSaving(false);
    fetchCategories();
  };

  const deleteCategory = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا القسم؟ قد يؤثر ذلك على الأخبار المرتبطة به.')) return;
    await supabase.from('categories').delete().eq('id', id);
    fetchCategories();
  };

  const filteredCategories = categories.filter(c => 
    c.name_ar.toLowerCase().includes(search.toLowerCase()) || 
    c.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="text-start">
          <h2 className="text-3xl font-black tracking-tight">إدارة الأقسام</h2>
          <p className="text-muted-foreground text-sm font-bold mt-1">إضافة وتعديل أقسام الأخبار في الموقع</p>
        </div>
        <Button onClick={handleCreate} className="font-black h-12 px-6 rounded-2xl shadow-lg shadow-primary/20">
          <Plus className="ml-2 h-5 w-5" />
          إضافة قسم جديد
        </Button>
      </div>

      <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-white">
        <CardContent className="p-0">
          <div className="p-6 border-b border-muted/30 flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-50/50">
            <div className="relative w-full md:w-96 text-start">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="البحث عن قسم..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pr-10 h-11 bg-white border-none rounded-xl shadow-sm focus:ring-2 focus:ring-primary/10 font-bold text-start"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow className="hover:bg-transparent border-b border-muted/30">
                  <TableHead className="text-right py-5 px-6 font-black text-slate-800">اسم القسم</TableHead>
                  <TableHead className="text-right py-5 px-6 font-black text-slate-800">الرابط (Slug)</TableHead>
                  <TableHead className="w-[120px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={3} className="py-20 text-center">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                    </TableCell>
                  </TableRow>
                ) : filteredCategories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="py-20 text-center text-muted-foreground font-bold">
                      لا توجد أقسام مطابقة للبحث
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCategories.map((cat) => (
                    <TableRow key={cat.id} className="hover:bg-slate-50/50 transition-colors border-b border-muted/20 last:border-none">
                      <TableCell className="py-5 px-6 text-start">
                        <div className="flex items-center gap-3">
                          <div className="bg-primary/10 p-2 rounded-xl text-primary">
                            <Tag className="h-4 w-4" />
                          </div>
                          <p className="font-black text-slate-900">{cat.name_ar}</p>
                        </div>
                      </TableCell>
                      <TableCell className="py-5 px-6 text-start font-mono text-xs text-slate-500" dir="ltr">
                        {cat.slug}
                      </TableCell>
                      <TableCell className="py-5 px-6">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-slate-100" onClick={() => handleEdit(cat)}>
                            <Pencil className="h-4 w-4 text-slate-400" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-red-50 text-red-500" onClick={() => deleteCategory(cat.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-[2rem] border-none shadow-2xl sm:max-w-[425px]" dir="rtl">
          <DialogHeader className="text-start">
            <DialogTitle className="text-2xl font-black">{editingCategory ? 'تعديل القسم' : 'إضافة قسم جديد'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="space-y-2 text-start">
              <label className="text-sm font-black text-slate-700">اسم القسم (بالعربية)</label>
              <Input 
                value={nameAr} 
                onChange={(e) => {
                  setNameAr(e.target.value);
                  if (!editingCategory) {
                    setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'));
                  }
                }}
                placeholder="أدخل اسم القسم..." 
                className="h-12 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-primary/20 font-bold"
              />
            </div>
            <div className="space-y-2 text-start">
              <label className="text-sm font-black text-slate-700">الرابط (Slug)</label>
              <Input 
                value={slug} 
                onChange={(e) => setSlug(e.target.value)}
                placeholder="slug-name" 
                dir="ltr"
                className="h-12 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-primary/20 font-mono text-sm"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)} className="rounded-xl font-bold h-11 px-6">إلغاء</Button>
            <Button onClick={saveCategory} disabled={saving} className="rounded-xl font-black h-11 px-8 shadow-lg shadow-primary/20">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'حفظ القسم'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
