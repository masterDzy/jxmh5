import type { JmProductDetailProps } from './props'
import { JmButton } from '../../functional/JmButton'

/**
 * JmProductDetail 商品详情内容组件
 *
 * 视觉:大图(4:3) + 分类 chip + 商品名 + 价格行(含划线原价) + 描述 + 操作按钮
 * 主题色通过 CSS 变量 `--product-detail-color` 接管,主色由 themeColor prop 传入
 *
 * 父容器:通常放在 JmServiceDetailDrawer / JmModal fullscreen 等容器内
 *
 * @example
 * <JmServiceDetailDrawer visible onClose categoryName="幸运商城" serviceName={p.name}>
 *   <JmProductDetail product={p} themeColor="var(--jm-color-brand-green, #A6BA43)" onAddToCart={handleAdd} />
 * </JmServiceDetailDrawer>
 */
export function JmProductDetail({
  product,
  themeColor = 'var(--jm-color-brand-green, #A6BA43)',
  onAddToCart,
  className = '',
}: JmProductDetailProps) {
  const hasDiscount = product.original_price && product.original_price > product.price

  return (
    <div
      className={`jm-product-detail ${className}`}
      style={{ '--product-detail-color': themeColor } as React.CSSProperties}
    >
      {/* 商品大图(4:3) */}
      <div className="jm-product-detail__cover">
        {product.cover_image ? (
          <img src={product.cover_image} alt={product.name} className="jm-product-detail__cover-img" />
        ) : (
          <div className="jm-product-detail__cover-placeholder">暂无图片</div>
        )}
      </div>

      {/* 分类 chip */}
      <span className="jm-product-detail__category">{product.category_name}</span>

      {/* 商品名 */}
      <h2 className="jm-product-detail__name">{product.name}</h2>

      {/* 价格行 */}
      <div className="jm-product-detail__price">
        <span className="jm-product-detail__price-current">¥{product.price.toFixed(2)}</span>
        {hasDiscount && (
          <span className="jm-product-detail__price-original">
            ¥{product.original_price!.toFixed(2)}
          </span>
        )}
      </div>

      {/* 描述 */}
      {product.description && (
        <p className="jm-product-detail__description">{product.description}</p>
      )}

      {/* 操作按钮 — 颜色跟随 themeColor,与卡片 chip 按钮同色系 */}
      <div className="jm-product-detail__actions">
        <JmButton
          variant="primary"
          size="lg"
          fullWidth
          color={themeColor}
          onClick={() => onAddToCart?.(product)}
          disabled={product.stock <= 0}
        >
          {product.stock <= 0 ? '已售罄' : '加入购物车'}
        </JmButton>
      </div>
    </div>
  )
}

export default JmProductDetail
