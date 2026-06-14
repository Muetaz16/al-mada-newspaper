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
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [nameAr, setNameAr] = useState('');
  const [slug, setSlug] = useState('');
  const [parentId, setParentId] = useState<string | null>(null);
  const [externalUrl, setExternalUrl] = useState('');
  const [sortOrder, setSortOrder] = useState<number>(0);
  
  const supabase = createClient();

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    setLoading(true);
    const { data } = await supabase.from('categories').select('*').order('sort_order', { ascending: true }).order('name_ar');
    if (data) setCategories(data);
    setLoading(false);
  }

  const handleEdit = (category: any) => {
    setEditingCategory(category);
    setNameAr(category.name_ar);
    setSlug(category.slug);
    setParentId(category.parent_id || null);
    setExternalUrl(category.external_url || '');
    setSortOrder(category.sort_order || 0);
    setOpen(true);
  };

  const handleCreate = () => {
    setEditingCategory(null);
    setNameAr('');
    setSlug('');
    setParentId(null);
    setExternalUrl('');
    setSortOrder(0);
    setOpen(true);
  };

  const saveCategory = async () => {
    if (!nameAr || !slug) return;
    setSaving(true);

    const payload = {
      name_ar: nameAr,
      slug,
      parent_id: parentId || null,
      external_url: externalUrl || null,
      sort_order: Number(sortOrder) || 0
    };

    if (editingCategory) {
      await supabase.from('categories').update(payload).eq('id', editingCategory.id);
    } else {
      await supabase.from('categories').insert(payload);
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

  // Build a visual hierarchy: place children categories directly beneath their parent category
  const buildHierarchy = (items: any[]) => {
    const roots = items.filter(c => !c.parent_id);
    const children = items.filter(c => c.parent_id);
    
    const list: any[] = [];
    roots.forEach(root => {
      list.push({ ...root, isChild: false });
      const rootChildren = children.filter(child => child.parent_id === root.id);
      rootChildren.forEach(child => {
        list.push({
          ...child,
          parentName: root.name_ar,
          isChild: true
        });
      });
    });
    
    // Catch-all for orphaned sub-categories if their parent is missing
    children.forEach(child => {
      if (!list.some(item => item.id === child.id)) {
        list.push({ ...child, isChild: true, parentName: 'مجهول' });
      }
    });
    
    return list;
  };

  const hierarchicalList = buildHierarchy(categories);
  const filteredCategories = hierarchicalList.filter(c => 
    c.name_ar.toLowerCase().includes(search.toLowerCase()) || 
    c.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="text-start">
          <h2 className="text-3xl font-black tracking-tight flex items-center gap-2">
            <Tag className="w-8 h-8 text-primary" />
            إدارة الأقسام (القائمة)
          </h2>
          <p className="text-muted-foreground text-sm font-bold mt-1">إنشاء الأقسام الرئيسية والأقسام الفرعية (القوائم المنسدلة)</p>
        </div>
        <Button onClick={handleCreate} className="font-black h-12 px-6 rounded-2xl shadow-lg shadow-primary/20">
          <Plus className="ml-2 h-5 w-5" />
          إضافة قسم جديد
        </Button>
      </div>

      {/* Help Alert Banner */}
      <div className="bg-slate-50 border border-slate-100 p-6 rounded-[2rem] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-start">
        <div className="space-y-1">
          <h4 className="font-black text-slate-900 text-sm flex items-center gap-2">
            💡 كيف تبني بنية شريط الموقع والقوائم المنسدلة؟
          </h4>
          <p className="text-xs text-slate-500 font-bold leading-relaxed">
            - الأقسام المحددة كـ <span className="text-primary font-black">قسم رئيسي</span> تظهر مباشرة في الشريط العلوي للموقع الإلكتروني.<br />
            - الأقسام المحددة بـ <span className="text-primary font-black">قسم رئيسي (أب) معين</span> ستظهر تلقائياً كقائمة منسدلة (Dropdown) تحت هذا القسم الرئيسي في شريط الموقع!
          </p>
        </div>
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
                  <TableHead className="text-right py-5 px-6 font-black text-slate-800">اسم القسم / القائمة</TableHead>
                  <TableHead className="text-right py-5 px-6 font-black text-slate-800">القسم الرئيسي</TableHead>
                  <TableHead className="text-right py-5 px-6 font-black text-slate-800">الترتيب</TableHead>
                  <TableHead className="text-right py-5 px-6 font-black text-slate-800">الرابط (Slug)</TableHead>
                  <TableHead className="w-[120px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-20 text-center">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                    </TableCell>
                  </TableRow>
                ) : filteredCategories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-20 text-center text-muted-foreground font-bold">
                      لا توجد أقسام مطابقة للبحث
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCategories.map((cat) => (
                    <TableRow key={cat.id} className="hover:bg-slate-50/50 transition-colors border-b border-muted/20 last:border-none">
                      <TableCell className="py-5 px-6 text-start">
                        <div className={`flex items-center gap-3 ${cat.isChild ? 'pr-8' : ''}`}>
                          {cat.isChild ? (
                            <span className="text-slate-400 font-black text-lg select-none">↳</span>
                          ) : null}
                          <div className={`p-2 rounded-xl ${cat.isChild ? 'bg-slate-100 text-slate-500' : 'bg-primary/10 text-primary'}`}>
                            <Tag className="h-4 w-4" />
                          </div>
                          <p className={`font-black ${cat.isChild ? 'text-slate-700 text-sm' : 'text-slate-900'}`}>{cat.name_ar}</p>
                        </div>
                      </TableCell>
                      <TableCell className="py-5 px-6 text-start">
                        {cat.isChild ? (
                          <span className="inline-flex items-center bg-slate-100 text-slate-700 text-[10px] font-black px-2.5 py-1 rounded-md">
                            {cat.parentName}
                          </span>
                        ) : (
                          <span className="inline-flex items-center bg-primary/5 text-primary text-[10px] font-black px-2.5 py-1 rounded-md">
                            قسم رئيسي (أب)
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="py-5 px-6 text-start font-black text-slate-600">
                        {cat.sort_order || 0}
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
        <DialogContent className="rounded-[2.5rem] border-none shadow-2xl sm:max-w-[450px] p-8 bg-white max-h-[90vh] flex flex-col overflow-hidden" dir="rtl">
          {/* Top Decorative bar */}
          <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-l from-primary to-primary/40" />

          <DialogHeader className="text-start pb-4 border-b border-slate-100 shrink-0">
            <DialogTitle className="text-2xl font-black flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Tag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 leading-tight">
                  {editingCategory ? 'تعديل القسم / القائمة' : 'إضافة قسم جديد'}
                </h3>
                <p className="text-xs text-slate-400 font-bold mt-1">تحديد تصنيفات الأخبار وبنية شريط تنقل الموقع</p>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-6 overflow-y-auto flex-1 pr-1 custom-scrollbar">
            <div className="space-y-2 text-start">
              <label className="text-xs font-black text-slate-500 uppercase tracking-wider">اسم القسم / القائمة (بالعربية)</label>
              <Input 
                value={nameAr} 
                onChange={(e) => {
                  setNameAr(e.target.value);
                  if (!editingCategory) {
                    setSlug(e.target.value.toLowerCase().replace(/[^\u0600-\u06FF\w\s-]/g, '').replace(/\s+/g, '-'));
                  }
                }}
                placeholder="مثلاً: الأخبار المحلية، اقتصاد، منوعات..." 
                className="h-13 rounded-2xl bg-slate-50 border-none focus-visible:ring-2 focus-visible:ring-primary/20 font-bold px-4 text-slate-800 text-base"
              />
              <p className="text-[10px] text-slate-400 font-bold">الاسم الذي يظهر للقراء في شريط التنقل العلوي للموقع.</p>
            </div>
            
            <div className="space-y-2 text-start">
              <div className="flex justify-between items-center">
                <label className="text-xs font-black text-slate-500 uppercase tracking-wider">القسم الرئيسي (التبعية)</label>
                {!parentId && (
                  <span className="text-[10px] bg-emerald-50 text-emerald-600 font-black px-2 py-0.5 rounded-md border border-emerald-100">قسم رئيسي</span>
                )}
                {parentId && (
                  <span className="text-[10px] bg-primary/5 text-primary font-black px-2 py-0.5 rounded-md border border-primary/10">قائمة فرعية</span>
                )}
              </div>
              <Select 
                onValueChange={(val) => setParentId(val === 'none' ? null : val)} 
                value={parentId || 'none'}
              >
                <SelectTrigger className="h-13 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-primary/20 font-bold px-4 text-slate-700">
                  <SelectValue placeholder="اختر قسماً رئيسياً" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-none shadow-2xl max-h-[250px]">
                  <SelectItem value="none" className="font-bold rounded-xl py-3 cursor-pointer text-slate-900 hover:bg-slate-100">
                    📂 بدون (قسم رئيسي / أعلى مستوى في شريط الموقع)
                  </SelectItem>
                  <div className="h-px bg-slate-100 my-1" />
                  {categories
                    .filter(c => !c.parent_id && c.id !== editingCategory?.id)
                    .map(c => (
                      <SelectItem key={c.id} value={c.id} className="font-bold rounded-xl py-3 cursor-pointer hover:bg-slate-100">
                        📄 {c.name_ar}
                      </SelectItem>
                    ))
                  }
                </SelectContent>
              </Select>
              <p className="text-[10px] text-slate-400 font-bold leading-normal">
                اختر قسماً رئيسياً لكي يظهر هذا القسم كقائمة منسدلة تحته، أو اتركه كقسم رئيسي ليظهر مباشرة في شريط التنقل.
              </p>
            </div>

            <div className="space-y-2 text-start">
              <label className="text-xs font-black text-slate-500 uppercase tracking-wider">ترتيب العرض (رقمي)</label>
              <Input 
                type="number"
                value={sortOrder} 
                onChange={(e) => setSortOrder(Number(e.target.value))}
                placeholder="0" 
                className="h-13 rounded-2xl bg-slate-50 border-none focus-visible:ring-2 focus-visible:ring-primary/20 font-bold px-4 text-slate-800 text-base"
              />
              <p className="text-[10px] text-slate-400 font-bold">الأرقام الأصغر (مثل 1, 2, 3...) تظهر أولاً في الترتيب.</p>
            </div>

            <div className="space-y-2 text-start">
              <label className="text-xs font-black text-slate-500 uppercase tracking-wider">رابط القسم الفرعي (Slug)</label>
              <Input 
                value={slug} 
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                placeholder="politics-news" 
                dir="ltr"
                className="h-13 rounded-2xl bg-slate-50 border-none focus-visible:ring-2 focus-visible:ring-primary/20 font-mono text-sm px-4 text-slate-800"
              />
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100/50 flex flex-col gap-1">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">معاينة رابط التصفح:</span>
                <span className="text-[10px] font-mono text-slate-500 overflow-hidden text-ellipsis whitespace-nowrap" dir="ltr">
                  https://almada.com/category/<span className="text-primary font-bold">{slug || 'slug'}</span>
                </span>
              </div>
            </div>

            <div className="space-y-2 text-start">
              <label className="text-xs font-black text-slate-500 uppercase tracking-wider">رابط خارجي (اختياري)</label>
              <Input 
                value={externalUrl} 
                onChange={(e) => setExternalUrl(e.target.value)}
                placeholder="https://example.com/product" 
                dir="ltr"
                className="h-13 rounded-2xl bg-slate-50 border-none focus-visible:ring-2 focus-visible:ring-primary/20 font-mono text-sm px-4 text-slate-800"
              />
              <p className="text-[10px] text-slate-400 font-bold leading-normal">
                إذا أردت توجيه هذا القسم إلى رابط خارجي (مثل صفحة منتج)، أدخل الرابط هنا.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2 pt-4 border-t border-slate-100 flex flex-row justify-end shrink-0">
            <Button variant="ghost" onClick={() => setOpen(false)} className="rounded-xl font-bold h-11 px-6 text-slate-500 hover:bg-slate-50">إلغاء</Button>
            <Button onClick={saveCategory} disabled={saving} className="rounded-xl font-black h-11 px-8 shadow-lg shadow-primary/20 bg-primary hover:scale-[1.02] transition-transform">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'حفظ التغييرات'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
