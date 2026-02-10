import { CATEGORIES } from '../../lib/categories';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Search } from 'lucide-react';
import { useState } from 'react';

interface CategoriesPageProps {
  onNavigate: (page: string, params?: any) => void;
}

export function CategoriesPage({ onNavigate }: CategoriesPageProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCategories = CATEGORIES.filter((cat) =>
    cat.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container py-12">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Browse Services</h1>
          <p className="mt-2 text-muted-foreground">
            Find the right professional for your needs
          </p>
        </div>

        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search for a service..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCategories.map((category) => (
            <Card
              key={category.id}
              className="cursor-pointer transition-all hover:shadow-soft"
              onClick={() => onNavigate('results', { category: category.id })}
            >
              <CardHeader className="text-center">
                <img
                  src={category.icon}
                  alt={category.label}
                  className="mx-auto mb-4 h-20 w-20 rounded-lg object-cover"
                />
                <CardTitle className="text-lg">{category.label}</CardTitle>
              </CardHeader>
            </Card>
          ))}
        </div>

        {filteredCategories.length === 0 && (
          <div className="py-12 text-center text-muted-foreground">
            No services found matching "{searchQuery}"
          </div>
        )}
      </div>
    </div>
  );
}
