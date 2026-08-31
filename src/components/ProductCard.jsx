import { useState } from 'react';
import Reveal from './Reveal';
import ProductArt from './ProductArt';

/**
 * Kartica artikla u Fan Shopu.
 *
 * Cijela kartica je poveznica na stranicu artikla u trgovini SalaSport —
 * klub nema vlastitu naplatu, pa kartica namjerno nema košaricu koja bi
 * ništa ne radila.
 *
 * Cijena se pokazuje samo ako je upisana. Prazna cijena znači "provjeri u
 * trgovini": bolje nego prepisan iznos koji za tjedan dana više ne vrijedi.
 */
export default function ProductCard({ product, index = 0 }) {
  const [imgFailed, setImgFailed] = useState(false);
  const showImage = Boolean(product.image) && !imgFailed;

  return (
    <Reveal
      as="a"
      variant="blur"
      delay={index * 70}
      className="product notch-br-18"
      href={product.href}
      target="_blank"
      rel="noopener noreferrer"
    >
      <div className="product__media">
        {product.badge && <span className="product__badge">{product.badge}</span>}

        {showImage ? (
          <img
            className="product__photo"
            src={product.image}
            alt={product.name}
            loading="lazy"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <ProductArt kind={product.art} name={product.artName} number={product.artNumber} />
        )}

        <span className="product__zoom" aria-hidden="true">
          ↗
        </span>
      </div>

      <div className="product__body">
        <span className="product__cat">
          {product.cat}
          {product.brand ? ` · ${product.brand}` : ''}
        </span>
        <h3 className="product__name">{product.name}</h3>
        {product.note && <p className="product__note">{product.note}</p>}

        <div className="product__foot">
          {product.price ? (
            <span className="product__price">
              {product.oldPrice && <s className="product__old">{product.oldPrice}</s>}
              {product.price}
            </span>
          ) : (
            <span className="product__price product__price--ask">Provjeri cijenu</span>
          )}
          <span className="product__cta">U trgovinu ↗</span>
        </div>
      </div>
    </Reveal>
  );
}
