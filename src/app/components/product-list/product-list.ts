import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../services/product';
import { Product } from '../../models/product';
import { FormsModule } from '@angular/forms'; // Important pour le [(ngModel)]

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './product-list.html',
  styleUrl: './product-list.scss'
})
export class ProductListComponent implements OnInit {
  // 1. Déclarations des propriétés (C'est ce qui manquait !)
  products: Product[] = [];
  filteredProducts: Product[] = []; 
  
  productForm!: FormGroup;
  isFormVisible: boolean = false;
  recherche: string = '';
  categorieSelectionnee: string = '';
  categories: string[] = [];

  constructor(private productService: ProductService, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.loadProducts();
    this.initForm();
  }

  // Initialisation du formulaire
  initForm(): void {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      category: [''],
      description: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0.1)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      image: ['']
    });
  }

  // Chargement depuis la BDD
  loadProducts() {
    this.productService.getProducts().subscribe({
      next: (res) => {
        this.products = res.data;
        this.filteredProducts = res.data; // Initialise la liste affichée
        // On filtre pour ne garder que les catégories qui existent et on dit à TS que c'est bien du string
        this.categories = [...new Set(this.products.map(p => p.category).filter(c => !!c))] as string[];
      },
      error: (err) => console.error('Erreur de chargement', err)
    });
  }

  // Logique de filtrage réactif
  filtrer(): void {
    this.filteredProducts = this.products.filter(p => {
      const matchNom = p.name.toLowerCase().includes(this.recherche.toLowerCase());
      const matchCat = this.categorieSelectionnee === '' || p.category === this.categorieSelectionnee;
      return matchNom && matchCat;
    });
  }

  toggleForm() {
    this.isFormVisible = !this.isFormVisible;
  }

  onSubmit() {
    if (this.productForm.valid) {
      // Ton code pour envoyer à Symfony ici
      console.log(this.productForm.value);
    }
  }

  onDelete(id: number) {
    if (confirm('Supprimer ce produit ?')) {
      this.productService.deleteProduct(id).subscribe(() => this.loadProducts());
    }
  }
}