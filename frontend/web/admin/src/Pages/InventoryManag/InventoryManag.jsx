import React, { useEffect, useState } from 'react'
import AddProductModal from './AddProductModal'
import EditProductModal from './EditProductModal'
import ProductTable from './ProductTable'
import InventoryService from '../../Services/Inventory/InventoryService'
import ResponseHandler from '../../Utils/Constants/ResponseHandler'
import Toaster from '../../Utils/Constants/Toaster'
import PdfGenerator from '../../Utils/Pdfs/PdfGenerator'

export default function InventoryManag() {
    const [loading, setLoading] = useState(false)
    const [products, setProducts] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [editingProductId, setEditingProductId] = useState(null)

    const fetchProducts = async () => {
        setLoading(true)
        try {
            const result = await InventoryService.getProducts()
            if (result.data.code === 200) {
                setProducts(result.data.data.products || [])
            }
        } catch (error) {
            ResponseHandler.handleResponse(error)
        } finally {
            setLoading(false)
        }
    }

    const handleEditProduct = (productId) => {
        console.log('Sửa sản phẩm với ID:', productId);
        if (!productId) {
            console.error('Không tìm thấy ID sản phẩm!');
            Toaster.justToast('error', 'Không thể chỉnh sửa sản phẩm: Thiếu ID sản phẩm');
            return;
        }
        setEditingProductId(productId);
        // Hiển thị modal sau khi thiết lập productId
        setTimeout(() => {
            const modalElement = document.getElementById('editProductModal');
            if (!modalElement) {
                console.error('Không tìm thấy modal element!');
                return;
            }
            const bootstrapModal = new window.bootstrap.Modal(modalElement);
            bootstrapModal.show();
        }, 100);
    }

    const handleEditModalClose = () => {
        setEditingProductId(null)
    }

    const handleProductDelete = async (productId) => {
        return new Promise(async (resolve, reject) => {
            try {
                const result = await InventoryService.deleteProduct(productId)
                if (result.data.code === 200) {
                    await fetchProducts() // Cập nhật danh sách sản phẩm
                    resolve(result.data)
                } else {
                    reject(new Error(result.data.message || 'Xóa sản phẩm thất bại'))
                }
            } catch (error) {
                console.error('Lỗi khi xóa sản phẩm:', error)
                ResponseHandler.handleResponse(error)
                reject(error)
            }
        })
    }

    const generatePDF = () => {
        Toaster.loadingToast('Đang tạo PDF...')
        try {
            const productHeaders = [
                { header: 'STT', dataKey: 'id' },
                { header: 'Tên sản phẩm', dataKey: 'name' },
                { header: 'Danh mục', dataKey: 'category' },
                { header: 'Giá', dataKey: 'price' },
                { header: 'Tồn kho', dataKey: 'stock' }
            ]
            
            const formattedProducts = products.map((product, index) => ({
                id: index + 1,
                name: product.name,
                category: product.category,
                price: `$${product.price}`,
                stock: product.stock
            }))
            
            Toaster.updateLoadingToast('success', 'Đang tạo PDF cho bạn', () => {})
            PdfGenerator.generatePdf(formattedProducts, "Danh sách sản phẩm", productHeaders)
        } catch (error) {
            Toaster.updateLoadingToast('error', 'Tạo PDF thất bại', () => {})
        } finally {
            Toaster.dismissLoadingToast()
        }
    }

    const handleSearch = (e) => {
        setSearchTerm(e.target.value)
    }

    const filteredProducts = products.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
    )

    useEffect(() => {
        fetchProducts()
    }, [])

    return (
        <div className="body-wrapper">
            <div className="container-fluid">
                {/*  Row 1 */}
                <div className="row">
                    <div className="col-12 d-flex align-items-stretch">
                        <div className="card w-100 shadow-sm">
                            <div className="card-body p-4">
                                <div className='d-flex justify-content-end align-items-center mb-4'>
                                    <button className='btn btn-outline-dark mx-2' onClick={generatePDF}>Xuất PDF</button>
                                    <button className='btn btn-success' data-bs-toggle="modal" data-bs-target="#addProductModal">Thêm mới</button>
                                </div>
                                <AddProductModal fetchProducts={fetchProducts} />
                                <EditProductModal 
                                    productId={editingProductId} 
                                    fetchProducts={fetchProducts} 
                                    onClose={handleEditModalClose}
                                />
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <h5 className="card-title fw-semibold">Danh sách sản phẩm</h5>
                                    <form className="position-relative">
                                        <input 
                                            type="text" 
                                            className="form-control search-chat py-2 ps-5" 
                                            id="text-srh" 
                                            placeholder="Tìm kiếm" 
                                            value={searchTerm}
                                            onChange={handleSearch}
                                        />
                                        <i className="ti ti-search position-absolute top-50 start-0 translate-middle-y fs-6 text-dark ms-3" />
                                    </form>
                                </div>
                                <div className="table-responsive">
                                    <ProductTable 
                                        products={filteredProducts} 
                                        loading={loading} 
                                        handleProductDelete={handleProductDelete}
                                        handleEditProduct={handleEditProduct}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
